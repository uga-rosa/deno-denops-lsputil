import { Denops, fn, LSP, op } from "../deps.ts";

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
  bufnr = bufnr === 0 ? await fn.bufnr(denops) : bufnr;
  try {
    await fn.bufload(denops, bufnr);
  } catch {
    throw new Error(`Invalid bufnr: ${bufnr}`);
  }
  await op.buflisted.setBuffer(denops, bufnr, true);
  return bufnr;
}

/**
 * Returns true if position 'a' is before position as 'b'.
 * If 'a' and 'b' are in same position, return false.
 */
export function isPositionBefore(
  a: LSP.Position,
  b: LSP.Position,
): boolean {
  return a.line < b.line ||
    (a.line === b.line && a.character < b.character);
}

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
 * A Utility function for creating `LSP.Range` object.
 */
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

export async function bufLineCount(
  denops: Denops,
  bufnr: number,
): Promise<number> {
  return await denops.eval(`getbufinfo(${bufnr})[0].linecount`) as number;
}
