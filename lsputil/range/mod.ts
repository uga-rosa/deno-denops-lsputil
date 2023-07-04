import { Denops, fn, LSP } from "../deps.ts";
import { bufLineCount, normalizeBufnr } from "../internal/util.ts";
import {
  OffsetEncoding,
  toUtf16Index,
  toUtf32Index,
  toUtf8Index,
} from "../offset_encoding/mod.ts";

export { createRange } from "../internal/util.ts";

export class LSPRangeError extends Error {
  static {
    this.prototype.name = "RangeError";
  }
  constructor(message: string, options?: ErrorOptions) {
    super(`Out of range: ${message}`, options);
  }
}

/**
 * Verify the validity of a specified range within the buffer.
 *
 * The range is provided as a 0-based utf-16 offset.
 *
 * The return values `startRow` and `endRow` are 1-based.
 *
 * If the range is out of bounds, an error `LSPRangeError` is thrown.
 */
export async function verifyRange(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
): Promise<{
  startRow: number;
  endRow: number;
  startLine: string;
  endLine: string;
}> {
  /** 1-based */
  const startRow = range.start.line + 1;
  const startLine = (await fn.getbufline(denops, bufnr, startRow))[0];
  /** 1-based */
  const endRow = range.end.line + 1;
  const endLine = (await fn.getbufline(denops, bufnr, endRow))[0];

  // Check range
  if (startLine === undefined) {
    throw new LSPRangeError("start row");
  }
  if (endLine === undefined) {
    throw new LSPRangeError("end row");
  }
  if (range.start.character < 0 || range.start.character > startLine.length) {
    throw new LSPRangeError("start col");
  }
  if (range.end.character < 0 || range.end.character > endLine.length) {
    throw new LSPRangeError("end col");
  }

  return { startRow, endRow, startLine, endLine };
}

/**
 * Verify the validity of a specified line-range within the buffer.
 *
 * The line-range is provided as a 0-based, end-exclusive.
 * Negative indices are interpreted as length+1+index: -1 refers to the index
 * past the end.
 *
 * The return values `startRow` and `endRow` are 1-based.
 *
 * If the range is out of bounds, an error `LSPRangeError` is thrown.
 */
export async function verifyLineRange(
  denops: Denops,
  bufnr: number,
  start: number,
  end: number,
): Promise<{
  startRow: number;
  endRow: number;
}> {
  const lineCount = await bufLineCount(denops, bufnr);
  // To 1-based
  const startRow = start >= 0 ? start + 1 : lineCount + start + 1;
  const endRow = end >= 0 ? end + 1 : lineCount + end + 1;

  // Check range
  if (startRow < 1 || startRow > lineCount) {
    throw new LSPRangeError("start");
  }
  if (endRow < 1 || endRow > lineCount + 1) {
    // end-exclusive
    throw new LSPRangeError("end");
  }
  if (startRow > endRow) {
    throw new LSPRangeError("'start' is higher than 'end'");
  }

  return { startRow, endRow };
}

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-8.
 */
export async function toUtf8Range(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Range> {
  range = structuredClone(range);
  if (offsetEncoding === "utf-8") {
    return range;
  }
  return await encode(denops, bufnr, range, toUtf8Index, offsetEncoding);
}

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-16.
 */
export async function toUtf16Range(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Range> {
  range = structuredClone(range);
  if (offsetEncoding === "utf-16") {
    return range;
  }
  return await encode(denops, bufnr, range, toUtf16Index, offsetEncoding);
}

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-32.
 */
export async function toUtf32Range(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Range> {
  range = structuredClone(range);
  if (offsetEncoding === "utf-32") {
    return range;
  }
  return await encode(denops, bufnr, range, toUtf32Index, offsetEncoding);
}

async function encode(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  encoder: (line: string, index: number, encoding?: OffsetEncoding) => number,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Range> {
  bufnr = await normalizeBufnr(denops, bufnr);
  range.start.character = encoder(
    (await fn.getbufline(denops, bufnr, range.start.line + 1))[0] ?? "",
    range.start.character,
    offsetEncoding,
  );
  range.end.character = encoder(
    (await fn.getbufline(denops, bufnr, range.end.line + 1))[0] ?? "",
    range.end.character,
    offsetEncoding,
  );
  return range;
}
