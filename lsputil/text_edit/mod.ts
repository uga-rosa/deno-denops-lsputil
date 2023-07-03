export class LSPRangeError extends Error {
  static {
    this.prototype.name = "RangeError";
  }
  constructor(message: string, options?: ErrorOptions) {
    super(`Out of range: ${message}`, options);
  }
}

export { bufSetText } from "./buf_set_text.ts";
