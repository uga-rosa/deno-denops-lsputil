import { test } from "../deps.ts";
import { createRange } from "../_internal/util.ts";
import { assertBuffer, setup } from "../_internal/test_util.ts";
import { setLines, setText } from "./set.ts";

const origBuffer = [
  "あいうえお",
  "かきく|けこ",
];

test({
  mode: "all",
  name: "setText()",
  fn: async (denops, t) => {
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

test({
  mode: "all",
  name: "setLines()",
  fn: async (denops, t) => {
    const suites = {
      insert: {
        start: 1,
        end: 1,
        replacement: ["さしすせそ"],
        expectedBuffer: [
          "あいうえお",
          "さしすせそ",
          "かきく|けこ",
        ],
      },
      delete: {
        start: 1,
        end: 2,
        replacement: [],
        expectedBuffer: [
          "あいう|えお",
        ],
      },
      replace: {
        start: 0,
        end: 2,
        replacement: ["さしすせそ", "たちつてと", "なにぬねの"],
        expectedBuffer: [
          "さしすせそ",
          "たちつ|てと",
          "なにぬねの",
        ],
      },
    };

    for (const [mode, suite] of Object.entries(suites)) {
      const { start, end, replacement, expectedBuffer } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const bufnr = await setup(denops, origBuffer, true);
          await setLines(denops, bufnr, start, end, replacement);
          await assertBuffer(denops, bufnr, expectedBuffer, true);
        },
      });
    }
  },
});
