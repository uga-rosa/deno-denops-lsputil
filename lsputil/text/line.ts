import { Range } from "./range.ts";
import { Position } from "./position.ts";

export class TextLine {
  public firstNonWhitespaceCharacterIndex: number;
  public isEmptyOrWhitespace: boolean;
  public lineNumber: number;
  public range: Range;
  public rangeIncludingLineBreak: Range;
  public text: string;

  constructor(lines: string[], lineNumber: number, eol: string) {
    this.text = lines[lineNumber];
    const index = this.text.search(/\S/);
    this.firstNonWhitespaceCharacterIndex = index > -1
      ? index
      : this.text.length;
    this.isEmptyOrWhitespace =
      this.firstNonWhitespaceCharacterIndex === this.text.length;
    this.lineNumber = lineNumber;
    this.range = new Range(
      new Position(lineNumber, 0),
      new Position(lineNumber, this.text.length),
    );
    this.rangeIncludingLineBreak = new Range(
      new Position(lineNumber, 0),
      new Position(lineNumber, this.text.length + eol.length),
    );
  }
}
