import { type Denops, fn, type LSP, op } from "../deps.ts";
import { bufLineCount } from "../_internal/util.ts";
import { toUtf16Position, toUtf8Position } from "../position/mod.ts";

/**
 * Get the cursor position.
 * 0-based and columns are utf-16 offset.
 */
export async function getCursor(
  denops: Denops,
): Promise<LSP.Position> {
  const virtuledit = await op.virtualedit.getWindow(denops, 0);
  await op.virtualedit.setWindow(denops, 0, "all");
  const [, row, col] = await fn.getpos(denops, ".");
  await op.virtualedit.setWindow(denops, 0, virtuledit);
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
  if (position.line < 0 || position.character < 0) {
    return;
  }
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
