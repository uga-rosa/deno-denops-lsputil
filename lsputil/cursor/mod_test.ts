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
