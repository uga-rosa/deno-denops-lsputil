import { Denops, fn, LSP } from "../deps.ts";
import { normalizeBufnr } from "../internal/util.ts";
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
 * The function verifies that this range lies within the limits of the buffer.
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
