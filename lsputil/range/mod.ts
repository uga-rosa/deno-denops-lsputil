import type { Denops, LSP } from "../deps.ts";
import {
  type OffsetEncoding,
  toUtf16Index,
  toUtf32Index,
  toUtf8Index,
} from "../offset_encoding/mod.ts";
import { ensureBufnr } from "../assert/mod.ts";
import { getLine } from "../buffer/get.ts";

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-8.
 */
export async function toUtf8Range(
  denops: Denops,
  bufnr: number,
  range: LSP.Range,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Range> {
  bufnr = await ensureBufnr(denops, bufnr);
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
  bufnr = await ensureBufnr(denops, bufnr);
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
  bufnr = await ensureBufnr(denops, bufnr);
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
  range.start.character = encoder(
    await getLine(denops, bufnr, range.start.line),
    range.start.character,
    offsetEncoding,
  );
  range.end.character = encoder(
    await getLine(denops, bufnr, range.end.line),
    range.end.character,
    offsetEncoding,
  );
  return range;
}
