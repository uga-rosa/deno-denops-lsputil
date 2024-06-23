import { applyWorkspaceEdit } from "./mod.ts";
import { assertEquals, fn, type LSP, test } from "../deps.ts";
import { createRange } from "../_internal/util.ts";

const OS = Deno.build.os === "windows" ? "windows" : "linux";

const file = {
  windows: {
    path: "C:\\Users\\foo",
    uri: "file:///C:/Users/foo",
  },
  linux: {
    path: "/home/foo",
    uri: "file:///home/foo",
  },
}[OS];

test({
  mode: "all",
  name: "applyWorkspaceEdit",
  async fn(denops, t) {
    await denops.cmd(`edit ${file.path}`);
    const bufnr = await fn.bufnr(denops);
    await fn.setline(denops, 1, [
      "const foo = 'foo'",
      "console.log(foo)",
    ]);

    await t.step({
      name: "documentChanges",
      async fn() {
        const workspaceEdit: LSP.WorkspaceEdit = {
          documentChanges: [
            {
              textDocument: {
                uri: file.uri,
                version: 1,
              },
              edits: [
                { range: createRange(0, 6, 0, 9), newText: "bar" },
                { range: createRange(1, 12, 1, 15), newText: "bar" },
              ],
            },
          ],
        };
        await applyWorkspaceEdit(denops, workspaceEdit);
        const lines = await fn.getbufline(denops, bufnr, 1, "$");
        assertEquals(lines, [
          "const bar = 'foo'",
          "console.log(bar)",
        ]);
      },
    });

    await t.step({
      name: "changes",
      async fn() {
        const workspaceEdit: LSP.WorkspaceEdit = {
          changes: {
            [file.uri]: [
              { range: createRange(0, 6, 0, 9), newText: "baz" },
              { range: createRange(1, 12, 1, 15), newText: "baz" },
            ],
          },
        };
        await applyWorkspaceEdit(denops, workspaceEdit);
        const lines = await fn.getbufline(denops, bufnr, 1, "$");
        assertEquals(lines, [
          "const baz = 'foo'",
          "console.log(baz)",
        ]);
      },
    });
  },
});
