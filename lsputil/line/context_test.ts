import { assertEquals, test } from "../deps.ts";
import { LineContext } from "./context.ts";
import { setup } from "../_internal/test_util.ts";

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

test({
  name: "LineContext",
  mode: "all",
  fn: async (denops, t) => {
    for (const [name, suite] of Object.entries(suites)) {
      const { buffer, expected } = suite;
      await t.step({
        name,
        fn: async () => {
          await setup(denops, buffer, true);
          const ctx = await LineContext.create(denops);
          assertEquals(ctx.character, expected.character);
          assertEquals(ctx.text, expected.text);
        },
      });
    }
  },
});
