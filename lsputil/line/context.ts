import { Denops, fn } from "../deps.ts";

/**
 * Context of the line where the cursor is.
 * 0-based and columns are utf-16 offset.
 */
export class LineContext {
  character: number;
  text: string;

  constructor(
    character: number,
    text: string,
  ) {
    this.character = character;
    this.text = text;
  }

  static async create(
    denops: Denops,
  ): Promise<LineContext> {
    const beforeLine = await denops.eval(
      `getline('.')[:col('.')-2]`,
    ) as string;
    const character = beforeLine.length;
    const text = await fn.getline(denops, ".");
    return new LineContext(character, text);
  }
}
