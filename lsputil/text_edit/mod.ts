import { api, Denops, fn, LSP } from "../deps.ts";
import { isPositionBefore, normalizeBufnr } from "../internal/util.ts";
import { toUtf8Index } from "../offset_encoding/mod.ts";

export class RangeError extends Error {
  static {
    this.prototype.name = "RangeError";
  }
  constructor(message: string, options?: ErrorOptions) {
    super(`Out of range: ${message}`, options);
  }
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
  const startRow = range.start.line + 1;
  const startLine = (await fn.getbufline(denops, bufnr, startRow))[0];
  /** 1-based */
  const endRow = range.end.line + 1;
  const endLine = (await fn.getbufline(denops, bufnr, endRow))[0];

  // Check range
  if (startLine === undefined) {
    throw new RangeError("start row");
  }
  if (endLine === undefined) {
    throw new RangeError("end row");
  }
  if (range.start.character < 0 || range.start.character > startLine.length) {
    throw new RangeError("start col");
  }
  if (range.end.character < 0 || range.end.character > endLine.length) {
    throw new RangeError("end col");
  }

  if (denops.meta.host === "nvim") {
    const startCol = toUtf8Index(startLine, range.start.character, "utf-16");
    const endCol = toUtf8Index(startLine, range.end.character, "utf-16");
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
    const source = await fn.getbufline(denops, bufnr, startRow, endRow);
    if (replacement.length === 0) {
      replacement = [
        source[0].slice(0, range.start.character) +
        source[source.length - 1].slice(range.end.character),
      ];
    } else {
      replacement[0] = source[0].slice(0, range.start.character) +
        replacement[0];
      replacement[replacement.length - 1] += source[source.length - 1].slice(
        range.end.character,
      );
    }
    await fn.appendbufline(denops, bufnr, endRow, replacement);
    // If you delete lines first, you may get an extra blank line.
    await fn.deletebufline(denops, bufnr, startRow, endRow);
    // Restore cursor position
    await fn.setpos(denops, ".", cursor);
  }
}
