import { assertEquals, fn, test } from "../deps.ts";
import { uriFromBufnr, uriFromFname, uriToBufnr, uriToFname } from "./mod.ts";

const validData = {
  windows: {
    fname: "C:\\Users\\foo",
    uri: "file:///C:/Users/foo",
  },
  linux: {
    fname: "/home/foo",
    uri: "file:///home/foo",
  },
};

const OS = Deno.build.os === "windows" ? "windows" : "linux";

Deno.test({
  name: "uriFromFname",
  fn: () => {
    assertEquals(
      uriFromFname(validData[OS].fname),
      validData[OS].uri,
    );
  },
});

test({
  mode: "all",
  name: "uriFromBufnr",
  async fn(denops) {
    await denops.cmd(`edit ${validData[OS].fname}`);
    const bufnr = await fn.bufnr(denops);
    assertEquals(await uriFromBufnr(denops, bufnr), validData[OS].uri);
  },
});

Deno.test({
  name: "uriToFname",
  fn: () => {
    if (Deno.build.os === "windows") {
      assertEquals(uriToFname(validData[OS].uri), validData[OS].fname);
    }
  },
});

test({
  mode: "all",
  name: "uriFromBufnr",
  async fn(denops) {
    await denops.cmd(`edit ${validData[OS].fname}`);
    const bufnr = await fn.bufnr(denops);
    assertEquals(await uriToBufnr(denops, validData[OS].uri), bufnr);
  },
});
