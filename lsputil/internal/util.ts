const ENCODER = new TextEncoder();
export function byteLength(
  s: string,
): number {
  return ENCODER.encode(s).length;
}
