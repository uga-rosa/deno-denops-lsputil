import { type Denops, dirname, fs, fn, type LSP } from "../deps.ts";
import type { OffsetEncoding } from "../offset_encoding/mod.ts";
import { applyTextEdits } from "../text_edit/mod.ts";
import { uriToBufnr, uriToFname } from "../uri/mod.ts";
import {
  bufDelete,
  printError,
  winSetBuf,
  writeBuffers,
} from "../_internal/util.ts";

/** Applies a WorkspaceEdit of LSP. */
export async function applyWorkspaceEdit(
  denops: Denops,
  workspaceEdit: LSP.WorkspaceEdit,
  offsetEncoding?: OffsetEncoding,
) {
  if (workspaceEdit.documentChanges) {
    for (const change of workspaceEdit.documentChanges) {
      if (!("kind" in change)) {
        await applyTextDocumentEdit(denops, change, offsetEncoding);
      } else if (change.kind === "create") {
        await createFile(denops, change);
      } else if (change.kind === "rename") {
        await renameFile(denops, change);
      } else if (change.kind === "delete") {
        await deleteFile(denops, change);
      } else {
        change satisfies never;
      }
    }
    return;
  }

  if (workspaceEdit.changes) {
    for (const [uri, textEdits] of Object.entries(workspaceEdit.changes)) {
      const bufnr = await uriToBufnr(denops, uri);
      await applyTextEdits(denops, bufnr, textEdits, offsetEncoding);
    }
  }
}

async function createFile(
  denops: Denops,
  change: LSP.CreateFile,
) {
  const path = uriToFname(change.uri);
  if (
    !fs.existsSync(path) ||
    (change.options?.overwrite || !change.options?.ignoreIfExists)
  ) {
    await Deno.mkdir(dirname(path), { recursive: true });
    await Deno.create(path);
  }
  await fn.bufadd(denops, path);
}

async function renameFile(
  denops: Denops,
  change: LSP.RenameFile,
) {
  const oldPath = uriToFname(change.oldUri);
  const newPath = uriToFname(change.newUri);

  if (fs.existsSync(newPath)) {
    if (!change.options?.overwrite || change.options.ignoreIfExists) {
      printError(
        denops,
        `Rename target ${change.newUri} already exists. Skipping rename.`,
      );
      return;
    }
    try {
      await Deno.remove(newPath, { recursive: true });
    } catch (e) {
      printError(denops, e);
      return;
    }
  }

  const bufinfo = await fn.getbufinfo(denops);
  const oldBufinfo = bufinfo.filter((info) => info.name.startsWith(oldPath));

  // Save current edits before rename
  await writeBuffers(denops, oldBufinfo.map((info) => info.bufnr));

  try {
    await Deno.rename(oldPath, newPath);
  } catch (e) {
    printError(denops, e);
    return;
  }

  await Promise.all(oldBufinfo.map(async (info) => {
    const newFilePath = info.name.replace(oldPath, newPath);
    const bufnr = await fn.bufadd(denops, newFilePath);
    await Promise.all(
      info.windows.map((winId) => winSetBuf(denops, winId, bufnr)),
    );
    await bufDelete(denops, info.bufnr);
  }));
}

async function deleteFile(
  denops: Denops,
  change: LSP.DeleteFile,
) {
  const path = uriToFname(change.uri);
  if (!fs.existsSync(path)) {
    if (!change.options?.ignoreIfNotExists) {
      printError(
        denops,
        `Cannot delete not existing file or directory ${path}`,
      );
    }
    return;
  }

  try {
    await Deno.remove(path, { recursive: change.options?.recursive });
  } catch (e) {
    printError(denops, e);
    return;
  }

  const bufnr = await fn.bufadd(denops, path);
  await bufDelete(denops, bufnr);
}

async function applyTextDocumentEdit(
  denops: Denops,
  change: LSP.TextDocumentEdit,
  offsetEncoding?: OffsetEncoding,
) {
  // Limitation: document version is not supported.
  const path = uriToFname(change.textDocument.uri);
  const bufnr = await fn.bufadd(denops, path);
  await applyTextEdits(denops, bufnr, change.edits, offsetEncoding);
}
