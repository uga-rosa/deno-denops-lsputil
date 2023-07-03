import { assertEquals } from "../deps.ts";
import {
  OffsetEncoding,
  toUtf16Index,
  toUtf32Index,
  toUtf8Index,
} from "./mod.ts";

const line = "abcあいう😀";

const encodings = [
  "utf-8",
  "utf-16",
  "utf-32",
] as const satisfies readonly OffsetEncoding[];

const lineLength = {
  "utf-8": 16,
  "utf-16": 8,
  "utf-32": 7,
} as const satisfies Record<OffsetEncoding, number>;

const decoder = {
  "utf-8": toUtf8Index,
  "utf-16": toUtf16Index,
  "utf-32": toUtf32Index,
} as const satisfies Record<
  OffsetEncoding,
  (line: string, utfIndex: number, offsetEncoding: OffsetEncoding) => number
>;

Deno.test({
  name: "offset_encoding",
  fn: async (t) => {
    for (const from of encodings) {
      for (const to of encodings) {
        await t.step({
          name: `from: ${from}, to: ${to}`,
          fn: () => {
            assertEquals(
              decoder[to](line, lineLength[from], from),
              lineLength[to],
            );
          },
        });
      }
    }
  },
});
