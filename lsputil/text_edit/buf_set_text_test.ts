import { test } from "../deps.ts";
import { createRange } from "../internal/util.ts";
import { assertBuffer, setup } from "../internal/test_util.ts";
import { bufSetText } from "./buf_set_text.ts";

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
