import { Denops, fn } from "../deps.ts";
import { LineContext } from "./context.ts";
import { createRange } from "../internal/util.ts";
import { applyTextEdits } from "../text_edit/mod.ts";
import { setCursor } from "../cursor/mod.ts";

/*
 * Replace the range of `before` and `after` the cursor with `text`.
 * 0-based and columns are utf-16 offset.
 *
 * NOTE: Do not include line breaks in `text`.
 */
export async function linePatch(
  denops: Denops,
  before: number,
  after: number,
  text: string,
): Promise<void> {
  const ctx = await LineContext.create(denops);
  const line = await fn.line(denops, ".") - 1;
  const range = createRange(
    line,
    ctx.character - before,
    line,
    ctx.character + after,
  );
  await applyTextEdits(denops, 0, [{ range, newText: text }]);
  await setCursor(denops, {
    line,
    character: range.start.character + text.length,
  });
}
