import { Denops, fn, LSP } from "../deps.ts";
import { toUtf16Index, toUtf8Index } from "../offset_encoding/mod.ts";

/** utf-16 offset, 0-based */
export async function getCursor(
  denops: Denops,
): Promise<LSP.Position> {
  const [, row, col] = await fn.getpos(denops, ".");
  const line = await fn.getline(denops, ".");
  const character = toUtf16Index(line, col - 1, "utf-8");
  return { line: row - 1, character };
}

/** utf-16 offset, 0-based */
export async function setCursor(
  denops: Denops,
  position: LSP.Position,
): Promise<void> {
  const row = position.line + 1;
  const line = await fn.getline(denops, row);
  const col = toUtf8Index(line, position.character, "utf-16") + 1;
  await fn.setpos(denops, ".", [0, row, col, 0]);
}
