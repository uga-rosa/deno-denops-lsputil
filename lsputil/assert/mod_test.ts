import { assertRejects, fn, test } from "../deps.ts";
import { createPosition, createRange } from "../_internal/util.ts";
import { setup } from "../_internal/test_util.ts";
import {
  assertPosition,
  assertRange,
  ensureBufnr,
  ensureLineRange,
  InvalidBufferError,
  LSPRangeError,
} from "./mod.ts";

test({
  mode: "all",
  name: "ensureBufnr()",
  fn: async (denops) => {
    await assertRejects(async () => {
      const lastBufnr = await fn.bufnr(denops, "$");
      await ensureBufnr(denops, lastBufnr + 1);
    }, InvalidBufferError);
  },
});

test({
  mode: "all",
  name: "assertPosition()",
  fn: async (denops) => {
    const bufnr = await setup(denops, [
      "foo",
      "bar",
    ], false);

    await assertPosition(denops, bufnr, createPosition(0, 0));
    await assertPosition(denops, bufnr, createPosition(1, 3));

    const rejectPatterns = [
      [-1, 0, "line"],
      [2, 0, "line"],
      [0, -1, "character"],
      [0, 4, "character"],
    ] satisfies [number, number, string][];
    for (const [line, character, msg] of rejectPatterns) {
      await assertRejects(
        () => assertPosition(denops, bufnr, { line, character }),
        LSPRangeError,
        msg,
      );
    }
  },
});

test({
  mode: "all",
  name: "assertRange()",
  fn: async (denops) => {
    const bufnr = await setup(denops, [
      "foo",
      "bar",
    ], false);

    await assertRange(denops, bufnr, createRange(0, 0, 1, 3));

    const rejectPatterns = [
      [-1, 0, 0, 0, "start line"],
      [0, -1, 0, 0, "start character"],
      [0, 0, 2, 0, "end line"],
      [0, 0, 1, 4, "end character"],
      [1, 0, 0, 0, "higher"],
    ] satisfies [number, number, number, number, string][];
    for (const [sl, sc, el, ec, msg] of rejectPatterns) {
      await assertRejects(
        () => assertRange(denops, bufnr, createRange(sl, sc, el, ec)),
        LSPRangeError,
        msg,
      );
    }
  },
});

test({
  mode: "all",
  name: "ensureLineRange()",
  fn: async (denops) => {
    const bufnr = await setup(denops, [
      "foo",
      "bar",
    ], false);

    await ensureLineRange(denops, bufnr, -3, -1);
    await ensureLineRange(denops, bufnr, 0, 2);

    const rejectPatterns = [
      [-100, 2, "start"],
      [100, 2, "start"],
      [0, -100, "end"],
      [0, 100, "end"],
      [2, 0, "higher"],
    ] satisfies [number, number, string][];
    for (const [start, end, msg] of rejectPatterns) {
      await assertRejects(
        () => ensureLineRange(denops, bufnr, start, end),
        LSPRangeError,
        msg,
      );
    }
  },
});
