import { assertEquals, Denops, fn } from "../deps.ts";
import { byteLength } from "./util.ts";

/** utf-8 offset, 1-based */
export function searchCursor(
  buffer: string[],
): [row: number, col: number] {
  const line = buffer.findIndex((text) => text.includes("|"));
  if (line === -1) {
    throw new Error("Invalid buffer: cursor not found");
  }
  const cursorPos = buffer[line].indexOf("|");
  buffer[line] = buffer[line].replace("|", "");
  const col = byteLength(buffer[line].slice(0, cursorPos)) + 1;
  return [line + 1, col];
}

export async function setup(
  denops: Denops,
  lines: string[],
  setCursor: boolean,
): Promise<number> {
  const bufnr = await fn.bufnr(denops);
  await fn.deletebufline(denops, bufnr, 1, "$");
  lines = [...lines];
  if (setCursor) {
    const [row, col] = searchCursor(lines);
    await fn.setbufline(denops, bufnr, 1, lines);
    await fn.setpos(denops, ".", [bufnr, row, col, 0]);
  } else {
    await fn.setbufline(denops, bufnr, 1, lines);
  }
  return bufnr;
}

export async function assertBuffer(
  denops: Denops,
  bufnr: number,
  expectedBuffer: string[],
  checkCursor: boolean,
) {
  const actualBuffer = await fn.getbufline(denops, bufnr, 1, "$");
  if (checkCursor) {
    const [, actualRow, actualCol] = await fn.getpos(denops, ".");
    const [expectedRow, expectedCol] = searchCursor(expectedBuffer);
    assertEquals(
      [actualRow, actualCol],
      [expectedRow, expectedCol],
      "Cursor is different than expected.",
    );
  }
  assertEquals(
    actualBuffer,
    expectedBuffer,
    "Buffer is different than expected.",
  );
}
