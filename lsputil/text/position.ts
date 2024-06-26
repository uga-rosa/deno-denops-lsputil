export class Position {
  /** The zero-based line value. */
  public line: number;
  /** The zero-based character value. */
  public character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }

  /**
   * Compare this to `other`.
   * @param other - A position.
   * @returns A number smaller than zero if this position is before the given position, a number greater than zero if this position is after the given position, or zero when this and the given position are equal.
   */
  compareTo(other: Position): number {
    if (this.isEqual(other)) {
      return 0;
    } else if (this.isAfter(other)) {
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * Check if this position is after `other`.
   * @param other - A position.
   * @returns `true` if position is on a greater line or on the same line on a greater character.
   */
  isAfter(other: Position): boolean {
    return this.line === other.line
      ? this.character > other.character
      : this.line > other.line;
  }

  /**
   * Check if this position is after or equal to `other`.
   * @param other - A position.
   * @returns `true` if position is on a greater line or on the same line on a greater or equal character.
   */
  isAfterOrEqual(other: Position): boolean {
    return this.isAfter(other) || this.isEqual(other);
  }

  /**
   * Check if this position is before `other`.
   * @param other - A position.
   * @returns `true` if position is on a smaller line or on the same line on a smaller character.
   */
  isBefore(other: Position): boolean {
    return this.line === other.line
      ? this.character < other.character
      : this.line < other.line;
  }

  /**
   * Check if this position is before or equal to `other`.
   * @param other - A position.
   * @returns `true` if position is on a smaller line or on the same line on a smaller or equal character.
   */
  isBeforeOrEqual(other: Position): boolean {
    return this.isBefore(other) || this.isEqual(other);
  }

  /**
   * Check if this position is equal to `other`.
   * @param other - A position.
   * @returns `true` if the line and character of the given position are equal to the line and character of this position.
   */
  isEqual(other: Position): boolean {
    return this.line === other.line && this.character === other.character;
  }

  /**
   * Create a new position relative to this position.
   * @param lineDelta - Delta value for the line value, default is `0`.
   * @param characterDelta - Delta value for the character value, default is `0`.
   * @returns A position which line and character is the sum of the current line and character and the corresponding deltas.
   */
  translate(lineDelta?: number, characterDelta?: number): Position {
    return new Position(
      this.line + (lineDelta ?? 0),
      this.character + (characterDelta ?? 0),
    );
  }

  /**
   * Create a new position derived from this position.
   * @param line Value that should be used as line value, default is the existing value
   * @param character Value that should be used as character value, default is the existing value
   * @returns A position where line and character are replaced by the given values.
   */
  with(line?: number, character?: number): Position {
    return new Position(line ?? this.line, character ?? this.character);
  }
}
