import { test } from "../deps.ts";
import { linePatch } from "./patch.ts";
import { assertBuffer, setup } from "../_internal/test_util.ts";

const origBuffer = [
  "あいう|えお",
];

const suites = {
  insert: {
    patch: {
      before: 0,
      after: 0,
      text: "かき",
    },
    expectedBuffer: [
      "あいうかき|えお",
    ],
  },
  delete: {
    patch: {
      before: 2,
      after: 1,
      text: "",
    },
    expectedBuffer: [
      "あ|お",
    ],
  },
  replace: {
    patch: {
      before: 3,
      after: 1,
      text: "かきくけ",
    },
    expectedBuffer: [
      "かきくけ|お",
    ],
  },
};

// In vim mode, fn.mode() always return 'c'.
test({
  mode: "nvim",
  name: "linePatch()",
  fn: async (denops, t) => {
    for (const [mode, suite] of Object.entries(suites)) {
      const { patch: { before, after, text }, expectedBuffer } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const bufnr = await setup(denops, origBuffer, true);
          await linePatch(denops, before, after, text);
          await assertBuffer(denops, bufnr, expectedBuffer, true);
        },
      });
    }
  },
});
