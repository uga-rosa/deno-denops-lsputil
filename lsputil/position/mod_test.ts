import { assertEquals, Denops, LSP, test } from "../deps.ts";
import { createPosition } from "../_internal/util.ts";
import { setup } from "../_internal/test_util.ts";
import { OffsetEncoding } from "../offset_encoding/mod.ts";
import { toUtf16Position, toUtf32Position, toUtf8Position } from "./mod.ts";

const origBuffer = [
  "abcあいう😀",
];

const encodings = [
  "utf-8",
  "utf-16",
  "utf-32",
] as const satisfies readonly OffsetEncoding[];

// Position from the end of the first line to the end of the second line
// 0-based
const range = {
  "utf-8": createPosition(0, 16),
  "utf-16": createPosition(0, 8),
  "utf-32": createPosition(0, 7),
} as const satisfies Record<OffsetEncoding, LSP.Position>;

const decoder = {
  "utf-8": toUtf8Position,
  "utf-16": toUtf16Position,
  "utf-32": toUtf32Position,
} as const satisfies Record<
  OffsetEncoding,
  (
    denops: Denops,
    bufnr: number,
    range: LSP.Position,
    encoding?: OffsetEncoding,
  ) => Promise<LSP.Position>
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
