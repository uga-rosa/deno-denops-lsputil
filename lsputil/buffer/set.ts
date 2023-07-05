import { api, Denops, fn, LSP } from "../deps.ts";
import { isPositionBefore, normalizeBufnr } from "../_internal/util.ts";
import { verifyLineRange } from "../range/mod.ts";
import { toUtf8Index } from "../offset_encoding/mod.ts";
import { LSPRangeError, verifyRange } from "../range/mod.ts";

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
): Promise<void> {
  if (isPositionBefore(range.end, range.start)) {
    throw new LSPRangeError(`'start' is higher than 'end'`);
  }
  bufnr = await normalizeBufnr(denops, bufnr);
  /** 1-based */
  const {
    startRow,
    endRow,
    startLine,
    endLine,
  } = await verifyRange(denops, bufnr, range);

  if (denops.meta.host === "nvim") {
    const startCol = toUtf8Index(startLine, range.start.character, "utf-16");
    const endCol = toUtf8Index(endLine, range.end.character, "utf-16");
    // 0-based
    // Extmarks will be preserved on non-modified parts of the touched lines.
    await api.nvim_buf_set_text(
      denops,
      bufnr,
      startRow - 1,
      startCol,
      endRow - 1,
      endCol,
      replacement,
    );
  } else {
    // Store cursor position
    const cursor = await fn.getpos(denops, ".");
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
    await fn.appendbufline(denops, bufnr, endRow, replacement);
    await fn.deletebufline(denops, bufnr, startRow, endRow);
    // Restore cursor position if bufnr points the current buffer.
    if (bufnr === await fn.bufnr(denops)) {
      await fn.setpos(denops, ".", cursor);
    }
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
  bufnr = await normalizeBufnr(denops, bufnr);
  const { startRow, endRow } = await verifyLineRange(denops, bufnr, start, end);

  // Store cursor position
  const cursor = await fn.getpos(denops, ".");
  // Deleting the lines first may create an extra blank line.
  await fn.appendbufline(denops, bufnr, endRow - 1, replacement);
  await fn.deletebufline(denops, bufnr, startRow, endRow - 1);
  // Restore cursor position if bufnr points the current buffer.
  if (bufnr === await fn.bufnr(denops)) {
    if (cursor[1] >= endRow) {
      cursor[1] += replacement.length - (endRow - startRow);
    }
    await fn.setpos(denops, ".", cursor);
  }
}
