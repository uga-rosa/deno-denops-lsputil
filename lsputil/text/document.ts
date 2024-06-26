import { type Denops, fn, op } from "../deps.ts";
import { Range } from "./range.ts";
import { Position } from "./position.ts";
import { TextLine } from "./line.ts";

export class TextDocument {
  private denops: Denops;
  private source: string;
  private bufnr: number;
  private lines: string[];

  public fileName: string;
  public eol: string;
  public filetype: string;
  public lineCount: number;

  constructor(
    denops: Denops,
    fileName: string,
    bufnr: number,
    lines: string[],
    eol: string,
    filetype: string,
  ) {
    // private
    this.denops = denops;
    this.source = lines.join(eol);
    this.bufnr = bufnr;
    this.lines = lines;
    // public
    this.fileName = fileName;
    this.eol = eol;
    this.filetype = filetype;
    this.lineCount = lines.length;
  }

  static async create(
    denops: Denops,
    fileName: string,
  ): Promise<TextDocument> {
    // Load file
    const bufnr = await fn.bufadd(denops, fileName);
    await op.buflisted.setBuffer(denops, bufnr, true);
    await fn.bufload(denops, bufnr);
    // Read buffer
    const { lines, eol } = await this.getSource(denops, bufnr);
    const filetype = await op.filetype.getBuffer(denops, bufnr);
    return new TextDocument(denops, fileName, bufnr, lines, eol, filetype);
  }

  static async getSource(
    denops: Denops,
    bufnr: number,
  ): Promise<{ lines: string[]; eol: string }> {
    const lines = await fn.getbufline(denops, bufnr, 1, "$");
    const ff = await op.fileformat.getBuffer(denops, bufnr);
    const eol = ff === "dos" ? "\r\n" : "\n";
    return { lines, eol };
  }

  async update(): Promise<void> {
    const { lines, eol } = await TextDocument.getSource(
      this.denops,
      this.bufnr,
    );
    this.lines = lines;
    this.eol = eol;
    this.source = lines.join(eol);
  }

  getText(range?: Range): string {
    if (range == null) {
      return this.source;
    }
    const lines: string[] = [];
    for (let i = range.start.line; i <= range.end.line; i++) {
      let line = this.lines[i];
      // Processing from behind works well, even if the range is only one line.
      if (i == range.end.line) {
        line = line.slice(0, range.end.character);
      }
      if (i == range.start.line) {
        line = line.slice(range.start.character);
      }
      lines.push(line);
    }
    return lines.join(this.eol);
  }

  lineAt(line: number): TextLine;
  lineAt(position: Position): TextLine;
  lineAt(pos: number | Position): TextLine {
    const lineNumber = typeof pos === "number" ? pos : pos.line;
    return new TextLine(this.lines, lineNumber, this.eol);
  }

  offsetAt(position: Position): number {
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += this.lines[i].length + this.eol.length;
    }
    offset += position.character;
    return offset;
  }

  positionAt(offset: number): Position {
    let line = 0;
    while (line < this.lineCount) {
      const lineLength = this.lines[line].length + this.eol.length;
      if (offset < lineLength) {
        break;
      }
      offset -= lineLength;
      line++;
    }
    return new Position(line, offset);
  }

  validatePosition(position: Position): Position {
    if (position.line >= this.lineCount) {
      const line = this.lineCount - 1;
      return new Position(line, this.lines[line].length);
    }
    const character = Math.min(
      position.character,
      this.lines[position.line].length,
    );
    return new Position(position.line, character);
  }

  validateRange(range: Range): Range {
    const start = this.validatePosition(range.start);
    const end = this.validatePosition(range.end);
    return new Range(start, end);
  }
}
