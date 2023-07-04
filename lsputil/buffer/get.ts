import { Denops, fn, LSP } from "../deps.ts";
import { normalizeBufnr } from "../internal/util.ts";
import { LSPRangeError, verifyLineRange, verifyRange } from "../mod.ts";

/**
 * Gets a range from the buffer.
 *
 * 0-based and columns are utf-16 offset. Only `range.end.character` is excluded.
 *
 * If the range specification is incorrect, an `LSPRangeError` is thrown.
 */
export async function getText(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
): Promise<string[]> {
  bufnr = await normalizeBufnr(denops, bufnr);
  const { startRow, endRow } = await verifyRange(denops, bufnr, range);

  const lines = await fn.getbufline(denops, bufnr, startRow, endRow);
  // Process from the end, taking into account the case of only one line.
  lines[lines.length - 1] = lines[lines.length - 1].slice(
    0,
    range.end.character,
  );
  lines[0] = lines[0].slice(range.start.character);
  return lines;
}

/**
 * Gets a line-range from the buffer.
 *
 * 0-based, end-exclusive.
 * Negative indices are interpreted as length+1+index: -1 refers to the index
 * past the end. So to change or delete the last element use start=-2 and end=-1.
 *
 * If the range specification is incorrect, an `LSPRangeError` is thrown.
 */
export async function getLines(
  denops: Denops,
  bufnr: number,
  start: number,
  end: number,
): Promise<string[]> {
  bufnr = await normalizeBufnr(denops, bufnr);
  const { startRow, endRow } = await verifyLineRange(denops, bufnr, start, end);
  if (startRow === endRow) {
    return [];
  }
  return await fn.getbufline(denops, bufnr, startRow, endRow - 1);
}

/**
 * Just like `getLines()` but only get one line and return it as a string.
 *
 * 0-based.
 *
 * If the range specification is incorrect, an `LSPRangeError` is thrown.
 */
export async function getLine(
  denops: Denops,
  bufnr: number,
  line: number,
): Promise<string> {
  bufnr = await normalizeBufnr(denops, bufnr);
  const lines = await fn.getbufline(denops, bufnr, line + 1);
  if (lines.length === 0) {
    throw new LSPRangeError("line");
  }
  return lines[0];
}
