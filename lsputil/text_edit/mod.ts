import { getCursor, setCursor } from "../cursor/mod.ts";
import { Denops, fn, LSP, op } from "../deps.ts";
import {
  bufLineCount,
  byteLength,
  isPositionBefore,
} from "../_internal/util.ts";
import { OffsetEncoding } from "../offset_encoding/mod.ts";
import { toUtf16Range } from "../range/mod.ts";
import { getLine, setText } from "../buffer/mod.ts";
import { ensureBufnr } from "../assert/mod.ts";

function normalizeRange(
  range: LSP.Range,
): LSP.Range {
  const { start, end } = range;
  if (isPositionBefore(end, start)) {
    return { start: end, end: start };
  }
  return range;
}

/**
 * Applies a list of `TextEdit` objects to a buffer.
 * Update the buffer and also move the cursor to the appropriate position.
 *
 * [Specification](https://microsoft.github.io/language-server-protocol/specifications/specification-current/#textEdit)
 */
export async function applyTextEdits(
  denops: Denops,
  bufnr: number,
  textEdits: LSP.TextEdit[],
  offsetEncoding: OffsetEncoding = "utf-16",
) {
  bufnr = await ensureBufnr(denops, bufnr);

  // Fix reversed range
  textEdits = textEdits.map((textEdit) => ({
    ...textEdit,
    range: normalizeRange(textEdit.range),
  }));
  // Execute in reverse order.
  textEdits.sort((a, b) =>
    isPositionBefore(a.range.start, b.range.start) ? 1 : -1
  );

  // Save local marks
  const markInfo = (await fn.getmarklist(denops, bufnr))
    .filter((info) => /^'[a-z]$/.test(info.mark));

  // Store cursor if bufnr points current buffer.
  const cursor = bufnr === await fn.bufnr(denops)
    ? await getCursor(denops)
    : { line: -1, character: -1 };
  let isCursorFixed = false;

  for (const textEdit of textEdits) {
    const newText = textEdit.newText.replace(/\r\n?/g, "\n");
    const replacement = newText.split("\n");
    const range = await toUtf16Range(
      denops,
      bufnr,
      textEdit.range,
      offsetEncoding,
    );
    const lineCount = await bufLineCount(denops, bufnr);
    if (range.start.line >= lineCount) {
      // Append lines to the end
      await fn.appendbufline(denops, bufnr, "$", replacement);
    } else {
      const endLine = await getLine(
        denops,
        bufnr,
        Math.min(range.end.line, lineCount - 1),
      );
      // Fix range
      if (range.end.line >= lineCount) {
        // Some LSP servers may return +1 range of the buffer content
        range.end = {
          line: lineCount - 1,
          character: endLine.length,
        };
      } else if (range.end.character > endLine.length) {
        range.end.character = endLine.length;
        if (newText.endsWith("\n")) {
          // Properly handling replacement that go beyond the end of a line,
          // and ensuring no extra empty lines are added.
          replacement.pop();
        }
      }
      await setText(denops, bufnr, range, replacement);

      // If range.end is before or at the same position as the cursor,
      // fix the cursor position.
      if (!isPositionBefore(cursor, range.end)) {
        if (range.end.line === cursor.line) {
          cursor.character += -range.end.character +
            replacement[replacement.length - 1].length;
          if (replacement.length === 1) {
            cursor.character += range.start.character;
          }
        }
        cursor.line += replacement.length -
          (range.end.line - range.start.line + 1);
        isCursorFixed = true;
      }
    }
  }

  const lineCount = await bufLineCount(denops, bufnr);

  // Restore local marks
  await Promise.all(markInfo.map(async (info) => {
    // row
    info.pos[1] = Math.min(info.pos[1], lineCount);
    const line = await getLine(denops, bufnr, info.pos[1] - 1);
    // col
    info.pos[2] = Math.min(info.pos[2], byteLength(line));
    await fn.setpos(denops, info.mark, info.pos);
  }));

  // Apply fixed cursor position
  if (isCursorFixed) {
    const line = await getLine(denops, bufnr, cursor.line);
    if (cursor.line < lineCount && cursor.character <= line.length) {
      await setCursor(denops, cursor);
    }
  }

  // Remove final line if needed
  if (
    (await op.endofline.getBuffer(denops, bufnr)) ||
    (await op.fixendofline.getBuffer(denops, bufnr) &&
      !(await op.binary.getBuffer(denops, bufnr)))
  ) {
    const lastLine = (await fn.getbufline(denops, bufnr, "$"))[0];
    if (lastLine === "") {
      await fn.deletebufline(denops, bufnr, "$");
    }
  }
}
