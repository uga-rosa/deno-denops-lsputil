import { type Denops, fn, type LSP } from "../deps.ts";
import type { OffsetEncoding } from "../offset_encoding/mod.ts";
import { toUtf16Position, toUtf32Position } from "../position/mod.ts";
import { uriFromBufnr } from "../uri/mod.ts";

export type TextDocumentPositionParams = {
  /** The text document. */
  textDocument: LSP.TextDocumentIdentifier;
  /** The position inside the text document. */
  position: LSP.Position;
};

export async function makeTextDocumentIdentifier(
  denops: Denops,
  bufNr?: number,
): Promise<LSP.TextDocumentIdentifier> {
  if (bufNr === 0 || bufNr === undefined) {
    bufNr = await fn.bufnr(denops);
  }
  return {
    uri: await uriFromBufnr(denops, bufNr),
  };
}

export async function makePositionParams(
  denops: Denops,
  bufNr?: number,
  winId?: number,
  offsetEncoding: OffsetEncoding = "utf-16",
): Promise<TextDocumentPositionParams> {
  bufNr = bufNr ?? await fn.bufnr(denops);
  winId = winId ?? await fn.win_getid(denops);

  const [, lnum, col] = await fn.getcurpos(denops, winId);
  let position: LSP.Position = { line: lnum - 1, character: col - 1 };
  if (offsetEncoding === "utf-16") {
    position = await toUtf16Position(denops, bufNr, position);
  } else if (offsetEncoding === "utf-32") {
    position = await toUtf32Position(denops, bufNr, position);
  }
  return {
    textDocument: await makeTextDocumentIdentifier(denops, bufNr),
    position,
  };
}
