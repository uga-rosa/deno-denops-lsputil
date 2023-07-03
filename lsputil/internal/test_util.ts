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
