import { assertEquals, fn, test } from "../deps.ts";
import { setup } from "./test_util.ts";
import {
  bufLineCount,
  byteLength,
  createPosition,
  createRange,
  isPositionBefore,
  normalizeBufnr,
} from "./util.ts";

Deno.test({
  name: "byteLength()",
  fn: () => {
    assertEquals(byteLength("abc"), 3);
    assertEquals(byteLength("あいう"), 9);
    assertEquals(byteLength("😀😀😀"), 12);
  },
});

test({
  mode: "all",
  name: "normalizeBufnr()",
  fn: async (denops) => {
    const bufnr = await fn.bufnr(denops);
    assertEquals(await normalizeBufnr(denops, 0), bufnr);
  },
});

Deno.test({
  name: "isPositionBefore()",
  fn: async (t) => {
    await t.step({
      name: "Lines are different",
      fn: () => {
        assertEquals(
          isPositionBefore(createPosition(0, 0), createPosition(1, 0)),
          true,
        );
        assertEquals(
          isPositionBefore(createPosition(1, 0), createPosition(0, 0)),
          false,
        );
      },
    });
    await t.step({
      name: "Lines are same",
      fn: () => {
        assertEquals(
          isPositionBefore(createPosition(0, 0), createPosition(0, 1)),
          true,
        );
        assertEquals(
          isPositionBefore(createPosition(0, 1), createPosition(0, 0)),
          false,
        );
        assertEquals(
          isPositionBefore(createPosition(0, 0), createPosition(0, 0)),
          false,
        );
      },
    });
  },
});

Deno.test({
  name: "createRange()",
  fn: () => {
    assertEquals(createRange(1, 2, 3, 4), {
      start: { line: 1, character: 2 },
      end: { line: 3, character: 4 },
    });
  },
});

Deno.test({
  name: "createPosition()",
  fn: () => {
    assertEquals(createPosition(1, 2), { line: 1, character: 2 });
  },
});

test({
  mode: "all",
  name: "bufLineCount()",
  fn: async (denops) => {
    const bufnr = await setup(denops, ["foo", "bar", "baz"], false);
    assertEquals(await bufLineCount(denops, bufnr), 3);
  },
});
