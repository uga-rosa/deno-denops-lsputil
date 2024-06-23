import { api, type Denops, fn, type LSP } from "../deps.ts";
import { assertRange, ensureBufnr, ensureLineRange } from "../assert/mod.ts";
import { getLine } from "./get.ts";

/**
 * Replaces a specific range within the buffer.
 *
 * 0-based and columns are utf-16 offset.
 *
 * If 'start' and 'end' are identical, this method performs an insertion
 * operation. If 'replacement' is an empty array (`[]`), this method performs a
 * deletion operation within the specified range.
 *
 * If the range specification is incorrect, an `LSPRangeError` is thrown.
 */
export async function setText(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  replacement: string[],
  options?: { undojoin: boolean },
): Promise<void> {
  bufnr = await ensureBufnr(denops, bufnr);
  await assertRange(denops, bufnr, range);
  options = { undojoin: options?.undojoin ?? false };

  // Store cursor position
  const cursor = await fn.getpos(denops, ".");
  const startLine = await getLine(denops, bufnr, range.start.line);
  const endLine = await getLine(denops, bufnr, range.end.line);
  if (replacement.length === 0) {
    replacement = [
      startLine.slice(0, range.start.character) +
      endLine.slice(range.end.character),
    ];
  } else {
    replacement = [...replacement];
    replacement[0] = startLine.slice(0, range.start.character) +
      replacement[0];
    replacement[replacement.length - 1] += endLine.slice(range.end.character);
  }
  // Deleting the lines first may create an extra blank line.
  if (options.undojoin) {
    await denops.cmd(
      `undojoin | call appendbufline(bufnr, lnum, replacement)`,
      { bufnr, lnum: range.end.line + 1, replacement },
    );
  } else {
    fn.appendbufline(denops, bufnr, range.end.line + 1, replacement);
  }
  await denops.cmd(`undojoin | call deletebufline(bufnr, start, end)`, {
    bufnr,
    start: range.start.line + 1,
    end: range.end.line + 1,
  });
  // Restore cursor position if bufnr points the current buffer.
  if (bufnr === await fn.bufnr(denops)) {
    await fn.setpos(denops, ".", cursor);
  }
}

/**
 * Replaces a specific lines within the buffer.
 *
 * 0-based, end-exclusive.
 * Negative indices are interpreted as length+1+index: -1 refers to the index
 * past the end. So to change or delete the last element use start=-2 and end=-1.
 *
 * If the range specification is incorrect, an `LSPRangeError` is thrown.
 */
export async function setLines(
  denops: Denops,
  bufnr: number,
  start: number,
  end: number,
  replacement: string[],
) {
  bufnr = await ensureBufnr(denops, bufnr);
  const {
    start: startFixed,
    end: endFixed,
  } = await ensureLineRange(denops, bufnr, start, end);

  if (denops.meta.host === "nvim") {
    await api.nvim_buf_set_lines(denops, bufnr, start, end, true, replacement);
    return;
  }

  // Store cursor position
  const cursor = await fn.getpos(denops, ".");
  // Deleting the lines first may create an extra blank line.
  await fn.appendbufline(denops, bufnr, endFixed, replacement);
  await fn.deletebufline(denops, bufnr, startFixed + 1, endFixed);
  // Restore cursor position if bufnr points the current buffer.
  if (bufnr === await fn.bufnr(denops)) {
    if (cursor[1] > endFixed) {
      cursor[1] += replacement.length - (endFixed - startFixed);
    }
    await fn.setpos(denops, ".", cursor);
  }
}
