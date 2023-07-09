import { Denops, fn } from "../deps.ts";

/**
 * Context of the line where the cursor is.
 * If in cmdline mode, it is obtained from the command line.
 *
 * 0-based and columns are utf-16 offset.
 *
 * ```typescript
 * import { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
 * import { LineContext } from "./context.ts"
 *
 * export async function main(denops: Denops): Promise<void> {
 *   const ctx = await LineContext.create(denops);
 *   // String before the cursor
 *   const beforeLine = ctx.text.slice(0, ctx.character);
 *   // String after the cursor
 *   const afterLine = ctx.text.slice(ctx.character);
 * }
 * ```
 */
export class LineContext {
  character: number;
  text: string;
  mode: string;

  constructor(
    character: number,
    text: string,
    mode?: string,
  ) {
    this.character = character;
    this.text = text;
    this.mode = mode ?? "i";
  }

  static async create(
    denops: Denops,
  ): Promise<LineContext> {
    const mode = await fn.mode(denops);
    if (mode === "c") {
      const beforeLine = await denops.eval(
        `getcmdline()[:getcmdpos()-2]`,
      ) as string;
      const character = beforeLine.length;
      const text = await fn.getcmdline(denops);
      return new LineContext(character, text, mode);
    } else {
      const beforeLine = await denops.eval(
        `getline('.')[:col('.')-2]`,
      ) as string;
      const character = beforeLine.length;
      const text = await fn.getline(denops, ".");
      return new LineContext(character, text, mode);
    }
  }
}
