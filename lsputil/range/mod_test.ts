import { assertEquals, Denops, LSP, test } from "../deps.ts";
import { toUtf16Range, toUtf32Range, toUtf8Range } from "./mod.ts";
import { setup } from "../internal/test_util.ts";
import { OffsetEncoding } from "../offset_encoding/mod.ts";
import { createRange } from "../internal/util.ts";

const origBuffer = [
  "abcあい",
  "う😀",
];

const encodings = [
  "utf-8",
  "utf-16",
  "utf-32",
] as const satisfies readonly OffsetEncoding[];

// Range from the end of the first line to the end of the second line
// 0-based
const range = {
  "utf-8": createRange(0, 9, 1, 7),
  "utf-16": createRange(0, 5, 1, 3),
  "utf-32": createRange(0, 5, 1, 2),
} as const satisfies Record<OffsetEncoding, LSP.Range>;

const decoder = {
  "utf-8": toUtf8Range,
  "utf-16": toUtf16Range,
  "utf-32": toUtf32Range,
} as const satisfies Record<
  OffsetEncoding,
  (
    denops: Denops,
    bufnr: number,
    range: LSP.Range,
    encoding?: OffsetEncoding,
  ) => Promise<LSP.Range>
>;

test({
  mode: "all",
  name: "encode range",
  fn: async (denops, t) => {
    for (const from of encodings) {
      for (const to of encodings) {
        await t.step({
          name: `from: ${from}, to: ${to}`,
          fn: async () => {
            const bufnr = await setup(denops, origBuffer, false);
            assertEquals(
              await decoder[to](denops, bufnr, range[from], from),
              range[to],
            );
          },
        });
      }
    }
  },
});
