import { Denops, fn } from "../deps.ts";
import { LineContext } from "../line_context/mod.ts";
import { createRange } from "../internal/util.ts";
import { applyTextEdits } from "../text_edit/mod.ts";
import { setCursor } from "../cursor/mod.ts";

/** 'before' and 'after' are utf-16 offset */
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
