import { assertEquals, Fn, fn, test } from "../deps.ts";
import { applyTextEdits } from "./mod.ts";
import { createRange } from "../_internal/util.ts";
import { assertBuffer, setup } from "../_internal/test_util.ts";

const origBuffer = [
  "あいうえお",
  "かきく|けこ",
];

const suites = {
  insert: {
    textEdit: {
      range: createRange(1, 3, 1, 3),
      newText: "さし",
    },
    expectedBuffer: [
      "あいうえお",
      "かきくさし|けこ",
    ],
  },
  delete: {
    textEdit: {
      range: createRange(0, 4, 1, 3),
      newText: "",
    },
    expectedBuffer: [
      "あいうえ|けこ",
    ],
  },
  replace: {
    textEdit: {
      range: createRange(0, 4, 1, 3),
      newText: "さし\nすせ",
    },
    expectedBuffer: [
      "あいうえさし",
      "すせ|けこ",
    ],
  },
};

const marks = [
  { mark: "'a", pos: [0, 1, 7, 0], file: "" },
  { mark: "'b", pos: [0, 1, 13, 0], file: "" },
] satisfies Fn.MarkInformation[];

test({
  mode: "all",
  name: "applyTextEdits()",
  fn: async (denops, t) => {
    for (const [mode, suite] of Object.entries(suites)) {
      const { textEdit, expectedBuffer } = suite;
      await t.step({
        name: mode,
        fn: async () => {
          const bufnr = await setup(denops, origBuffer, true);
          for (const info of marks) {
            await fn.setpos(denops, info.mark, info.pos);
          }
          await applyTextEdits(denops, bufnr, [textEdit]);
          await assertBuffer(denops, bufnr, expectedBuffer, true);
          for (const info of marks) {
            assertEquals(await fn.getpos(denops, info.mark), info.pos);
          }
        },
      });
    }
  },
});
