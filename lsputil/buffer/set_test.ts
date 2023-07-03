import { test } from "../deps.ts";
import { createRange } from "../internal/util.ts";
import { assertBuffer, setup } from "../internal/test_util.ts";
import { setText } from "./set.ts";

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

test({
  mode: "all",
  name: "bufSetText()",
  fn: async (denops, t) => {
    for (const [mode, suite] of Object.entries(suites)) {
      const { range, replacement, expectedBuffer } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const bufnr = await setup(denops, origBuffer, true);
          await setText(denops, bufnr, range, replacement);
          await assertBuffer(denops, bufnr, expectedBuffer, true);
        },
      });
    }
  },
});
