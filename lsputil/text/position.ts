export class Position {
  public line: number;
  public character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  compareTo(other: Position): number {
    if (this.isEqual(other)) {
      return 0;
    } else if (this.isAfter(other)) {
      return 1;
    } else {
      return -1;
    }
  }

  isAfter(other: Position): boolean {
    return this.line === other.line
      ? this.character > other.character
      : this.line > other.line;
  }

  isAfterOrEqual(other: Position): boolean {
    return this.isAfter(other) || this.isEqual(other);
  }

  isBefore(other: Position): boolean {
    return this.line === other.line
      ? this.character < other.character
      : this.line < other.line;
  }

  isBeforeOrEqual(other: Position): boolean {
    return this.isBefore(other) || this.isEqual(other);
  }

  isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }

  translate(lineDelta?: number, characterDelta?: number): Position {
    return new Position(
      this.line + (lineDelta ?? 0),
      this.character + (characterDelta ?? 0),
    );
  }

  with(line?: number, character?: number): Position {
    return new Position(line ?? this.line, character ?? this.character);
  }
}
