import { api, batch, type Denops, fn, type LSP } from "../deps.ts";

const ENCODER = new TextEncoder();
export function byteLength(
  s: string,
): number {
  return ENCODER.encode(s).length;
}

/**
 * Returns true if position 'a' is before position as 'b'.
 * If 'a' and 'b' are in same position, return false.
 * If allowSame is set to true, return true even if 'a' and 'b' are in same position.
 */
export function isPositionBefore(
  a: LSP.Position,
  b: LSP.Position,
  allowSame?: boolean,
): boolean {
  if (allowSame && a.line === b.line && a.character === b.character) {
    return true;
  }
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
  bufnr = bufnr === 0 ? await fn.bufnr(denops) : bufnr;
  return await denops.eval(`getbufinfo(${bufnr})[0].linecount`) as number;
}

export async function printError(
  denops: Denops,
  message: unknown,
): Promise<void> {
  await batch(denops, async (helper) => {
    await helper.cmd("echohl Error");
    await helper.cmd("echomsg l:message", { message: String(message) });
    await helper.cmd("echohl NONE");
  });
}

export async function writeBuffers(
  denops: Denops,
  buffers: number[],
): Promise<void> {
  const currentBufNr = await fn.bufnr(denops);
  try {
    await batch(denops, async (denops) => {
      for (const bufnr of buffers) {
        await fn.bufload(denops, bufnr);
        await denops.cmd(`noautocmd buffer ${bufnr}`);
        await denops.cmd(`noautocmd write`);
      }
    });
  } finally {
    await denops.cmd(`noautocmd buffer ${currentBufNr}`);
  }
}

export async function winSetBuf(
  denops: Denops,
  winId: number,
  bufnr: number,
): Promise<void> {
  if (denops.meta.host === "nvim") {
    await denops.call("nvim_win_set_buf", winId, bufnr);
  } else {
    await denops.cmd(`noautocmd call win_execute(${winId}, 'buffer ${bufnr}')`);
  }
}

export async function bufDelete(
  denops: Denops,
  bufnr: number,
) {
  if (denops.meta.host === "nvim") {
    await api.nvim_buf_delete(denops, bufnr, { force: true });
  } else {
    await denops.cmd(`bw! ${bufnr}`);
  }
}
