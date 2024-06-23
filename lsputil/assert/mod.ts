import { type Denops, fn, type LSP, op } from "../deps.ts";
import { bufLineCount, isPositionBefore } from "../_internal/util.ts";

export class InvalidBufferError extends Error {
  static {
    this.prototype.name = "InvalidBufferError";
  }
  constructor(buffer: string | number, options?: ErrorOptions) {
    super(`Invalid buffer: ${buffer}`, options);
  }
}

export class LSPRangeError extends Error {
  static {
    this.prototype.name = "LSPRangeError";
  }
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/**
 * This function ensures the validity of a provided bufnr and load the buffer.
 * The 0 representing the current buffer is corrected to the actual bufnr.
 *
 * If the buffer does not exist, `InvalidBufferError` will be thrown.
 */
export async function ensureBufnr(
  denops: Denops,
  bufnr: number,
): Promise<number> {
  bufnr = bufnr === 0 ? await fn.bufnr(denops) : bufnr;
  try {
    await fn.bufload(denops, bufnr);
  } catch {
    throw new InvalidBufferError(bufnr);
  }
  await op.buflisted.setBuffer(denops, bufnr, true);
  return bufnr;
}

/** low-level helper. Don't check range. */
async function _getLine(
  denops: Denops,
  bufnr: number,
  line: number,
): Promise<string | undefined> {
  return (await fn.getbufline(denops, bufnr, line + 1))[0];
}

/**
 * This function asserts the validity of a provided position within a buffer.
 *
 * The position is assumed to be 0-based and utf-16 offset.
 *
 * If the position is out of bounds, `LSPRangeError` will be thrown.
 */
export async function assertPosition(
  denops: Denops,
  bufnr: number,
  position: LSP.Position,
): Promise<void> {
  const line = await _getLine(denops, bufnr, position.line);
  if (line === undefined) {
    throw new LSPRangeError("Out of range: line");
  }
  if (position.character < 0 || position.character > line.length) {
    throw new LSPRangeError("Out of range: character");
  }
}

/**
 * This function asserts the validity of a provided range within a buffer.
 *
 * The range is assumed to be 0-based and utf-16 offset.
 *
 * If the range is out of bounds, `LSPRangeError` will be thrown.
 */
export async function assertRange(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
): Promise<void> {
  const startLine = await _getLine(denops, bufnr, range.start.line);
  const endLine = await _getLine(denops, bufnr, range.end.line);
  if (startLine === undefined) {
    throw new LSPRangeError("Out of range: start line");
  }
  if (endLine === undefined) {
    throw new LSPRangeError("Out of range: end line");
  }
  if (range.start.character < 0 || range.start.character > startLine.length) {
    throw new LSPRangeError("Out of range: start character");
  }
  if (range.end.character < 0 || range.end.character > endLine.length) {
    throw new LSPRangeError("Out of range: end character");
  }
  if (isPositionBefore(range.end, range.start)) {
    throw new LSPRangeError(`'start' is higher than 'end'`);
  }
}

/**
 * This function ensures the validity of a provided line-range within a buffer.
 * It also corrects any negative numbers within the line-range, and finally returns
 * the corrected start and end values.
 *
 * The line-range is assumed to be 0-based and end-exclusive. If negative indices
 * are provided, they are interpreted as: length+1+index, where -1 refers to the
 * index past the end.
 *
 * If the range is out of bounds, `LSPRangeError` will be thrown.
 */
export async function ensureLineRange(
  denops: Denops,
  bufnr: number,
  start: number,
  end: number,
): Promise<{
  start: number;
  end: number;
}> {
  const lineCount = await bufLineCount(denops, bufnr);
  start = start >= 0 ? start : lineCount + 1 + start;
  end = end >= 0 ? end : lineCount + 1 + end;

  if (start < 0 || start > lineCount) {
    throw new LSPRangeError("Out of range: start");
  }
  if (end < 0 || end > lineCount) {
    throw new LSPRangeError("Out of range: end");
  }
  if (start > end) {
    throw new LSPRangeError("'start' is higher than 'end'");
  }

  return { start, end };
}
