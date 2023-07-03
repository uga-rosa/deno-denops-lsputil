import { Denops, fn, LSP } from "../deps.ts";
import { normalizeBufnr } from "../internal/util.ts";
import {
  OffsetEncoding,
  toUtf16Index,
  toUtf32Index,
  toUtf8Index,
} from "../offset_encoding/mod.ts";

export class LSPRangeError extends Error {
  static {
    this.prototype.name = "RangeError";
  }
  constructor(message: string, options?: ErrorOptions) {
    super(`Out of range: ${message}`, options);
  }
}

export async function checkRange(
  denops: Denops,
  bufnr: number,
  /** utf-16 offset, 0-based */
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

/** Don't check range */
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

/** Don't check range */
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

/** Don't check range */
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
