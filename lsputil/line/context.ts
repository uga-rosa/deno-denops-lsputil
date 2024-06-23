import { type Denops, fn } from "../deps.ts";

function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

const Encoder = new TextEncoder();
const Decoder = new TextDecoder("utf-8", { fatal: true });
function byteSlice(text: string, start: number, end: number): string {
  const encoded = Encoder.encode(text);
  start = clamp(start, 0, encoded.length);
  end = clamp(end, start, encoded.length);
  const sliced = encoded.slice(start, end);
  try {
    return Decoder.decode(sliced);
  } catch {
    return "";
  }
}

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
    const text = mode === "c"
      ? await fn.getcmdline(denops)
      : await fn.getline(denops, ".");
    const pos = mode === "c"
      ? await fn.getcmdpos(denops)
      : await fn.col(denops, ".");
    const beforeLine = byteSlice(text, 0, pos - 1);
    const character = beforeLine.length;
    return new LineContext(character, text, mode);
  }
}
