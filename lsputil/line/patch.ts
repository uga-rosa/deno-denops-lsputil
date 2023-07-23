import { Denops, fn } from "../deps.ts";
import { LineContext } from "./context.ts";
import { byteLength, createRange } from "../_internal/util.ts";
import { setText } from "../buffer/mod.ts";
import { setCursor } from "../cursor/mod.ts";

/**
 * Replace the range of `before` and `after` the cursor with `text`.
 * If in cmdline mode, edit cmdline. Otherwise, edit the buffer.
 *
 * 0-based and columns are utf-16 offset.
 *
 * NOTE: In cmdline mode, do not include line breaks in `text`.
 *
 * ```typescript
 * import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
 * import { LineContext } from "./context.ts"
 * import { linePatch } from "./patch.ts"
 *
 * export async function main(denops: Denops): Promise<void> {
 *   const ctx = await LineContext.create(denops);
 *   // String before the cursor
 *   const beforeLine = ctx.text.slice(0, ctx.character);
 *   // Replace string before the cursor with 'foo'
 *   await linePatch(denops, beforeLine.length, 0, "foo");
 * }
 * ```
 */
export async function linePatch(
  denops: Denops,
  before: number,
  after: number,
  text: string,
): Promise<void> {
  const ctx = await LineContext.create(denops);
  if (ctx.mode === "c") {
    const pre = ctx.text.slice(0, ctx.character - before);
    const post = ctx.text.slice(ctx.character + after);
    const newLine = pre + text + post;
    const cursorPos = byteLength(pre + text) + 1;
    await fn.setcmdline(denops, newLine, cursorPos);
  } else {
    const line = await fn.line(denops, ".") - 1;
    const range = createRange(
      line,
      ctx.character - before,
      line,
      ctx.character + after,
    );
    const insertLines = text.split("\n");
    await setText(denops, 0, range, insertLines);
    if (insertLines.length == 1) {
      await setCursor(denops, {
        line,
        character: range.start.character + text.length,
      });
    } else {
      await setCursor(denops, {
        line: line + insertLines.length - 1,
        character: insertLines[insertLines.length - 1].length,
      });
    }
  }
}
