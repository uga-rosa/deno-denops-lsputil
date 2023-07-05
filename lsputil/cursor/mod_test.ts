import { assertEquals, test } from "../deps.ts";
import { assertBuffer, setup } from "../_internal/test_util.ts";
import { getCursor, setCursor } from "./mod.ts";

test({
  mode: "all",
  name: "Set/Get cursor",
  fn: async (denops) => {
    const bufnr = await setup(denops, [
      "foobarbaz",
      "あいう|えお",
      "😇😇😇😇😇",
    ], true);

    assertEquals(await getCursor(denops), { line: 1, character: 3 });
    await setCursor(denops, { line: 2, character: 4 });
    await assertBuffer(denops, bufnr, [
      "foobarbaz",
      "あいうえお",
      "😇😇|😇😇😇",
    ], true);
    assertEquals(await getCursor(denops), { line: 2, character: 4 });
  },
});

test({
  mode: "all",
  name: "clamp position",
  fn: async (denops) => {
    await setup(denops, [
      "foobarbaz",
      "あいうえお",
      "😇😇😇😇😇",
    ], false);

    // clamp line
    await setCursor(denops, { line: 3, character: 0 });
    assertEquals(await getCursor(denops), { line: 2, character: 0 });

    // Cancel if a negative number is included
    await setCursor(denops, { line: 0, character: -1 });
    assertEquals(await getCursor(denops), { line: 2, character: 0 });
    await setCursor(denops, { line: -1, character: 0 });
    assertEquals(await getCursor(denops), { line: 2, character: 0 });

    // clamp character
    await setCursor(denops, { line: 2, character: 100 });
    assertEquals(await getCursor(denops), { line: 2, character: 8 });

    // clamp character (insert mode)
    await denops.cmd("startinsert");
    await setCursor(denops, { line: 2, character: 100 });
    assertEquals(await getCursor(denops), { line: 2, character: 10 });
  },
});
