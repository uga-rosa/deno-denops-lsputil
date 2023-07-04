import { assertEquals, test } from "../deps.ts";
import { createRange } from "../internal/util.ts";
import { setup } from "../internal/test_util.ts";
import { getLine, getLines, getText } from "./get.ts";

const origBuffer = [
  "あいうえお",
  "かきく|けこ",
];

test({
  mode: "all",
  name: "getText()",
  fn: async (denops, t) => {
    const suites = {
      singleLine: {
        range: createRange(0, 1, 0, 4),
        expectedText: [
          "いうえ",
        ],
      },
      multiLine: {
        range: createRange(0, 4, 1, 3),
        expectedText: [
          "お",
          "かきく",
        ],
      },
    };

    const bufnr = await setup(denops, origBuffer, true);
    for (const [mode, suite] of Object.entries(suites)) {
      const { range, expectedText } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const text = await getText(denops, bufnr, range);
          assertEquals(text, expectedText);
        },
      });
    }
  },
});

test({
  mode: "all",
  name: "getLines()",
  fn: async (denops, t) => {
    const suites = {
      singleLine: {
        start: 0,
        end: 1,
        expectedLines: [
          "あいうえお",
        ],
      },
      multiLine: {
        start: 0,
        end: 2,
        expectedLines: [
          "あいうえお",
          "かきくけこ",
        ],
      },
    };

    const bufnr = await setup(denops, origBuffer, true);
    for (const [mode, suite] of Object.entries(suites)) {
      const { start, end, expectedLines } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const lines = await getLines(denops, bufnr, start, end);
          assertEquals(lines, expectedLines);
        },
      });
    }
  },
});

test({
  mode: "all",
  name: "getLine()",
  fn: async (denops) => {
    const bufnr = await setup(denops, origBuffer, true);
    const line = await getLine(denops, bufnr, 0);
    assertEquals(line, "あいうえお");
  },
});
