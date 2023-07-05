import { Denops, fn, LSP } from "../deps.ts";
import { bufLineCount } from "../_internal/util.ts";
import { toUtf16Position, toUtf8Position } from "../position/mod.ts";

/**
 * Get the cursor position.
 * 0-based and columns are utf-16 offset.
 */
export async function getCursor(
  denops: Denops,
): Promise<LSP.Position> {
  const [, row, col] = await fn.getpos(denops, ".");
  return await toUtf16Position(
    denops,
    0,
    { line: row - 1, character: col - 1 },
    "utf-8",
  );
}

/**
 * Set the cursor to the position.
 * 0-based and columns are utf-16 offset.
 */
export async function setCursor(
  denops: Denops,
  position: LSP.Position,
): Promise<void> {
  const lineCount = await bufLineCount(denops, 0);
  position.line = Math.min(position.line, lineCount - 1);
  position = await toUtf8Position(denops, 0, position, "utf-16");
  await fn.setpos(denops, ".", [
    0,
    position.line + 1,
    position.character + 1,
    0,
  ]);
}
