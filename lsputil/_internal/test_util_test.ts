import { assertEquals, fn, test } from "../deps.ts";
import { assertBuffer, searchCursor, setup } from "./test_util.ts";

Deno.test({
  name: "searchCursor()",
  fn: () => {
    assertEquals(searchCursor(["foo", "ba|r"]), [2, 3]);
    assertEquals(searchCursor(["あいうえお", "かきくけ|こ"]), [2, 13]);
  },
});

test({
  mode: "all",
  name: "setup()",
  fn: async (denops, t) => {
    await t.step({
      name: "setCursor is true",
      fn: async () => {
        const bufnr = await setup(denops, ["あいうえお", "かきくけ|こ"], true);
        assertEquals(await fn.getbufline(denops, bufnr, 1, "$"), [
          "あいうえお",
          "かきくけこ",
        ]);
        assertEquals(await fn.getpos(denops, "."), [0, 2, 13, 0]);
      },
    });
    await t.step({
      name: "setCursor is false",
      fn: async () => {
        const bufnr = await setup(denops, ["あいうえお", "かきくけこ"], false);
        assertEquals(await fn.getbufline(denops, bufnr, 1, "$"), [
          "あいうえお",
          "かきくけこ",
        ]);
        assertEquals(await fn.getpos(denops, "."), [0, 1, 1, 0]);
      },
    });
  },
});

test({
  mode: "all",
  name: "assertBuffer()",
  fn: async (denops, t) => {
    await t.step({
      name: "checkCursor is true",
      fn: async () => {
        const bufnr = await setup(denops, ["あいうえお", "かきくけ|こ"], true);
        await assertBuffer(denops, bufnr, ["あいうえお", "かきくけ|こ"], true);
      },
    });
    await t.step({
      name: "checkCursor is false",
      fn: async () => {
        const bufnr = await setup(denops, ["あいうえお", "かきくけこ"], false);
        await assertBuffer(denops, bufnr, ["あいうえお", "かきくけこ"], false);
      },
    });
  },
});
