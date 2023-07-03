import { api, Denops, fn, LSP } from "../deps.ts";
import { isPositionBefore, normalizeBufnr } from "../internal/util.ts";
import { toUtf8Index } from "../offset_encoding/mod.ts";
import { checkRange } from "../range/mod.ts";

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
