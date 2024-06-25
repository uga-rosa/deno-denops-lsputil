import type { Position } from "./position.ts";

export class Range {
  public start: Position;
  public end: Position;
  public isEmpty: boolean;
  public isSingleLine: boolean;

  constructor(start: Position, end: Position) {
    if (start.isAfter(end)) {
      [start, end] = [end, start];
    }
    this.start = start;
    this.end = end;
    this.isEmpty = start.isEqual(end);
    this.isSingleLine = start.line === end.line;
  }

  contains(positionOrRange: Position | Range): boolean {
    if ("line" in positionOrRange) {
      const position = positionOrRange;
      return position.isAfterOrEqual(this.start) && position.isBefore(this.end);
    } else {
      const range = positionOrRange;
      return range.start.isAfterOrEqual(this.start) &&
        range.end.isBeforeOrEqual(this.end);
    }
  }

  intersection(other: Range): Range | undefined {
    const start = other.start.isAfter(this.start) ? other.start : this.start;
    const end = other.end.isBefore(this.end) ? other.end : this.end;
    if (start.isBeforeOrEqual(end)) {
      return new Range(start, end);
    }
  }

  isEqual(other: Range): boolean {
    return this.start.isEqual(other.start) && this.end.isEqual(other.end);
  }

  union(other: Range): Range {
    const start = other.start.isBefore(this.start) ? other.start : this.start;
    const end = other.end.isAfter(this.end) ? other.end : this.end;
    return new Range(start, end);
  }

  with(start?: Position, end?: Position): Range {
    return new Range(start ?? this.start, end ?? this.end);
  }
}
