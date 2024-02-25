import { assertEquals, fn, test } from "../deps.ts";
import { uriFromBufnr, uriFromFname, uriToBufnr, uriToFname } from "./mod.ts";

const validData = {
  windows: [{
    fname: "C:\\Users\\foo",
    uri: "file:///C:/Users/foo",
  }, {
    fname: "ssh://foo/bar",
    uri: "ssh://foo/bar",
  }],
  linux: [{
    fname: "/home/foo",
    uri: "file:///home/foo",
  }, {
    fname: "ssh://foo/bar",
    uri: "ssh://foo/bar",
  }],
};

const OS = Deno.build.os === "windows" ? "windows" : "linux";

Deno.test({
  name: "uriFromFname",
  fn: () => {
    for (const data of validData[OS]) {
      assertEquals(
        uriFromFname(data.fname),
        data.uri,
      );
    }
  },
});

test({
  mode: "all",
  name: "uriFromBufnr",
  async fn(denops) {
    for (const data of validData[OS]) {
      await denops.cmd(`edit ${data.fname}`);
      const bufnr = await fn.bufnr(denops);
      assertEquals(await uriFromBufnr(denops, bufnr), data.uri);
    }
  },
});

Deno.test({
  name: "uriToFname",
  fn: () => {
    for (const data of validData[OS]) {
      assertEquals(uriToFname(data.uri), data.fname);
    }
  },
});

test({
  mode: "all",
  name: "uriFromBufnr",
  async fn(denops) {
    for (const data of validData[OS]) {
      await denops.cmd(`edit ${data.fname}`);
      const bufnr = await fn.bufnr(denops);
      assertEquals(await uriToBufnr(denops, data.uri), bufnr);
    }
  },
});
