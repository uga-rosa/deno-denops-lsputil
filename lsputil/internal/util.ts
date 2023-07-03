import { Denops, fn, LSP } from "../deps.ts";

const ENCODER = new TextEncoder();
export function byteLength(
  s: string,
): number {
  return ENCODER.encode(s).length;
}

export async function normalizeBufnr(
  denops: Denops,
  bufnr: number,
): Promise<number> {
  return bufnr === 0 ? await fn.bufnr(denops) : bufnr;
}

/**
 * Returns true if position 'a' is before or at the same position as 'b'.
 */
export function isPositionBefore(
  a: LSP.Position,
  b: LSP.Position,
): boolean {
  return a.line < b.line ||
    (a.line === b.line && a.character <= b.character);
}

export function createRange(
  startLine: number,
  startCharacter: number,
  endLine: number,
  endCharacter: number,
): LSP.Range {
  return {
    start: { line: startLine, character: startCharacter },
    end: { line: endLine, character: endCharacter },
  };
}
