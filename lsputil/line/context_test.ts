import { assertEquals, test } from "../deps.ts";
import { LineContext } from "./context.ts";
import { setup } from "../internal/test_util.ts";

test({
  name: "single byte line",
  mode: "nvim",
  fn: async (denops) => {
    await setup(denops, ["foo|bar"], true);
    const ctx = await LineContext.create(denops);
    assertEquals(ctx.text, "foobar");
    assertEquals(ctx.character, 3);
  },
});

test({
  name: "multi byte line",
  mode: "nvim",
  fn: async (denops) => {
    await setup(denops, ["あい😀|う"], true);
    const ctx = await LineContext.create(denops);
    assertEquals(ctx.text, "あい😀う");
    assertEquals(ctx.character, 4);
  },
});
