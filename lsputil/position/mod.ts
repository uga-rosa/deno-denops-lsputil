import { Denops, LSP } from "../deps.ts";
import {
  OffsetEncoding,
  toUtf16Index,
  toUtf32Index,
  toUtf8Index,
} from "../offset_encoding/mod.ts";
import { ensureBufnr } from "../assert/mod.ts";
import { getLine } from "../buffer/get.ts";

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-8.
 */
export async function toUtf8Position(
  denops: Denops,
  bufnr: number,
  position: LSP.Position,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Position> {
  bufnr = await ensureBufnr(denops, bufnr);
  position = structuredClone(position);
  if (offsetEncoding === "utf-8") {
    return position;
  }
  return await encode(denops, bufnr, position, toUtf8Index, offsetEncoding);
}

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-16.
 */
export async function toUtf16Position(
  denops: Denops,
  bufnr: number,
  position: LSP.Position,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Position> {
  bufnr = await ensureBufnr(denops, bufnr);
  position = structuredClone(position);
  if (offsetEncoding === "utf-16") {
    return position;
  }
  return await encode(denops, bufnr, position, toUtf16Index, offsetEncoding);
}

/**
 * Convert offset in utf-8|utf-16|utf-32 to offset in utf-32.
 */
export async function toUtf32Position(
  denops: Denops,
  bufnr: number,
  position: LSP.Position,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Position> {
  bufnr = await ensureBufnr(denops, bufnr);
  position = structuredClone(position);
  if (offsetEncoding === "utf-32") {
    return position;
  }
  return await encode(denops, bufnr, position, toUtf32Index, offsetEncoding);
}

async function encode(
  denops: Denops,
  bufnr: number,
  position: LSP.Position,
  encoder: (line: string, index: number, encoding?: OffsetEncoding) => number,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<LSP.Position> {
  position.character = encoder(
    await getLine(denops, bufnr, position.line),
    position.character,
    offsetEncoding,
  );
  return position;
}
