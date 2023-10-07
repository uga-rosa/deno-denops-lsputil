import { assertEquals, test } from "../deps.ts";
import { setup } from "../_internal/test_util.ts";
import { makePositionParams } from "./mod.ts";

test({
  mode: "all",
  name: "makePositionParams",
  fn: async (denops) => {
    await denops.cmd("e /foo");
    await setup(denops, [
      "qwertyuiop[]'",
      "asdf|ghjkl:",
      "zxcvbnm,./",
    ], true);
    const params = await makePositionParams(denops);
    const uri = "file:///foo";
    assertEquals(params, {
      textDocument: { uri },
      position: { line: 1, character: 4 },
    });
  },
});
