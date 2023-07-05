import { Denops, fn, LSP } from "../deps.ts";
import {
  assertPosition,
  assertRange,
  ensureBufnr,
  ensureLineRange,
} from "../assert/mod.ts";

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
  bufnr = await ensureBufnr(denops, bufnr);
  await assertRange(denops, bufnr, range);

  const lines = await fn.getbufline(
    denops,
    bufnr,
    range.start.line + 1,
    range.end.line + 1,
  );
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
  bufnr = await ensureBufnr(denops, bufnr);
  const {
    start: startFixed,
    end: endFixed,
  } = await ensureLineRange(denops, bufnr, start, end);
  if (startFixed === endFixed) {
    return [];
  }
  return await fn.getbufline(denops, bufnr, startFixed + 1, endFixed);
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
  bufnr = await ensureBufnr(denops, bufnr);
  await assertPosition(denops, bufnr, { line, character: 0 });
  return (await fn.getbufline(denops, bufnr, line + 1))[0];
}
