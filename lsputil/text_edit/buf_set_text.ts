import { api, Denops, fn, LSP } from "../deps.ts";
import { LSPRangeError } from "./mod.ts";
import { isPositionBefore, normalizeBufnr } from "../internal/util.ts";
import { toUtf8Index } from "../offset_encoding/mod.ts";

export async function checkRange(
  denops: Denops,
  bufnr: number,
  /** utf-16 offset, 0-based */
  range: LSP.Range,
): Promise<{
  startRow: number;
  endRow: number;
  startLine: string;
  endLine: string;
}> {
  /** 1-based */
  const startRow = range.start.line + 1;
  const startLine = (await fn.getbufline(denops, bufnr, startRow))[0];
  /** 1-based */
  const endRow = range.end.line + 1;
  const endLine = (await fn.getbufline(denops, bufnr, endRow))[0];

  // Check range
  if (startLine === undefined) {
    throw new LSPRangeError("start row");
  }
  if (endLine === undefined) {
    throw new LSPRangeError("end row");
  }
  if (range.start.character < 0 || range.start.character > startLine.length) {
    throw new LSPRangeError("start col");
  }
  if (range.end.character < 0 || range.end.character > endLine.length) {
    throw new LSPRangeError("end col");
  }

  return { startRow, endRow, startLine, endLine };
}

export async function bufSetText(
  denops: Denops,
  bufnr: number,
  /** utf-16 offset, 0-based */
  range: LSP.Range,
  replacement: string[],
): Promise<void> {
  bufnr = await normalizeBufnr(denops, bufnr);

  // Fix reversed range
  const { start, end } = range;
  if (!isPositionBefore(start, end)) {
    range = { start: end, end: start };
  }

  /** 1-based */
  const {
    startRow,
    endRow,
    startLine,
    endLine,
  } = await checkRange(denops, bufnr, range);

  if (denops.meta.host === "nvim") {
    const startCol = toUtf8Index(startLine, range.start.character, "utf-16");
    const endCol = toUtf8Index(endLine, range.end.character, "utf-16");
    // 0-based
    // Extmarks will be preserved on non-modified parts of the touched lines.
    await api.nvim_buf_set_text(
      denops,
      bufnr,
      startRow - 1,
      startCol,
      endRow - 1,
      endCol,
      replacement,
    );
  } else {
    // Store cursor position
    const cursor = await fn.getpos(denops, ".");
    if (replacement.length === 0) {
      replacement = [
        startLine.slice(0, range.start.character) +
        endLine.slice(range.end.character),
      ];
    } else {
      replacement[0] = startLine.slice(0, range.start.character) +
        replacement[0];
      replacement[replacement.length - 1] += endLine.slice(range.end.character);
    }
    // Deleting the lines first may create an extra blank line.
    await fn.appendbufline(denops, bufnr, endRow, replacement);
    await fn.deletebufline(denops, bufnr, startRow, endRow);
    // Restore cursor position
    await fn.setpos(denops, ".", cursor);
  }
}
