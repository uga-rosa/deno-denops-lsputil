import { assertEquals, fn, test } from "../deps.ts";
import { LineContext } from "./context.ts";
import { setup } from "../_internal/test_util.ts";

// In vim mode, fn.mode() always return 'c'.
test({
  mode: "nvim",
  name: "LineContext",
  fn: async (denops, t) => {
    const suites = {
      "single byte": {
        buffer: ["foo|bar"],
        expected: {
          text: "foobar",
          character: 3,
        },
      },
      "multi byte": {
        buffer: ["あい😀|う"],
        expected: {
          text: "あい😀う",
          character: 4,
        },
      },
    };

    for (const [name, suite] of Object.entries(suites)) {
      const { buffer, expected } = suite;
      await t.step({
        name,
        fn: async () => {
          await setup(denops, buffer, true);
          const ctx = await LineContext.create(denops);
          assertEquals(ctx.character, expected.character, "character");
          assertEquals(ctx.text, expected.text, "text");
          assertEquals(ctx.mode, "n", "mode");
        },
      });
    }
  },
});

test({
  mode: "nvim",
  name: "cmdline",
  fn: async (denops) => {
    await fn.feedkeys(denops, ":");
    await fn.setcmdline(denops, "foobar", 4);
    const ctx = await LineContext.create(denops);
    assertEquals(ctx.character, 3, "character");
    assertEquals(ctx.text, "foobar", "text");
    assertEquals(ctx.mode, "c", "mode");
  },
});
