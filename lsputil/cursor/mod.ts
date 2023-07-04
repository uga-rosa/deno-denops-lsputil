import { Denops, fn, LSP } from "../deps.ts";
import { toUtf16Index, toUtf8Index } from "../offset_encoding/mod.ts";

/**
 * A Utility function for creating `LSP.Position` object.
 */
export function createPosition(
  line: number,
  character: number,
): LSP.Position {
  return { line, character };
}

/**
 * Get the cursor position.
 * 0-based and columns are utf-16 offset.
 */
export async function getCursor(
  denops: Denops,
): Promise<LSP.Position> {
  const [, row, col] = await fn.getpos(denops, ".");
  const line = await fn.getline(denops, ".");
  const character = toUtf16Index(line, col - 1, "utf-8");
  return { line: row - 1, character };
}

/**
 * Set the cursor to the position.
 * 0-based and columns are utf-16 offset.
 */
export async function setCursor(
  denops: Denops,
  position: LSP.Position,
): Promise<void> {
  const row = position.line + 1;
  const line = await fn.getline(denops, row);
  const col = toUtf8Index(line, position.character, "utf-16") + 1;
  await fn.setpos(denops, ".", [0, row, col, 0]);
}
