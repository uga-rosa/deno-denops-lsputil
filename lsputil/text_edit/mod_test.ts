import { assertEquals, Denops, fn, test } from "../deps.ts";
import { createRange } from "../internal/util.ts";
import { searchCursor } from "../internal/test_util.ts";
import { bufSetText } from "./mod.ts";

async function setup(
  denops: Denops,
  lines: string[],
): Promise<number> {
  const bufnr = await fn.bufnr(denops);
  await fn.deletebufline(denops, bufnr, 1, "$");
  lines = [...lines];
  const [row, col] = searchCursor(lines);
  await fn.setbufline(denops, bufnr, 1, lines);
  await fn.setpos(denops, ".", [bufnr, row, col, 0]);
  return bufnr;
}

async function assertBuffer(
  denops: Denops,
  bufnr: number,
  expectedBuffer: string[],
) {
  const actualBuffer = await fn.getbufline(denops, bufnr, 1, "$");
  const [, actualRow, actualCol] = await fn.getpos(denops, ".");
  const [expectedRow, expectedCol] = searchCursor(expectedBuffer);
  assertEquals(
    actualBuffer,
    expectedBuffer,
    "Buffer is different than expected.",
  );
  assertEquals(
    [actualRow, actualCol],
    [expectedRow, expectedCol],
    "Cursor is different than expected.",
  );
}

test({
  mode: "all",
  name: "bufSetText()",
  fn: async (denops, t) => {
    const origBuffer = [
      "あいうえお",
      "かきく|けこ",
    ];

    const suites = {
      insert: {
        range: createRange(1, 3, 1, 3),
        replacement: ["さし"],
        expectedBuffer: [
          "あいうえお",
          "かきく|さしけこ",
        ],
      },
      delete: {
        range: createRange(0, 4, 1, 3),
        replacement: [],
        expectedBuffer: [
          "あいう|えけこ",
        ],
      },
      replace: {
        range: createRange(0, 4, 1, 3),
        replacement: ["さし", "すせ"],
        expectedBuffer: [
          "あいうえさし",
          "すせけ|こ",
        ],
      },
    };

    for (const mode of Object.keys(suites)) {
      await t.step({
        name: mode,
        fn: async () => {
          const { range, replacement, expectedBuffer } =
            suites[mode as keyof typeof suites];

          const bufnr = await setup(denops, origBuffer);
          await bufSetText(denops, bufnr, range, replacement);
          await assertBuffer(denops, bufnr, expectedBuffer);
        },
      });
    }
  },
});
