import { type Denops, fn, fromFileUrl, toFileUrl } from "../deps.ts";

/** Gets a URI from a file path. */
export function uriFromFname(
  fname: string,
): string {
  try {
    return toFileUrl(fname).toString();
  } catch {
    return fname;
  }
}

/** Gets a URI from a bufnr. */
export async function uriFromBufnr(
  denops: Denops,
  bufnr: number,
): Promise<string> {
  bufnr = bufnr > 0 ? bufnr : await fn.bufnr(denops);
  const fname = await denops.eval(
    `fnamemodify(bufname(${bufnr}), ':p')`,
  ) as string;
  try {
    return uriFromFname(fname);
  } catch {
    return fname;
  }
}

/** Gets a filename from a URI. */
export function uriToFname(
  uri: string,
): string {
  try {
    return fromFileUrl(uri);
  } catch {
    return uri;
  }
}

/**
 * Gets the buffer for a uri.
 * Creates a new unloaded buffer if no buffer for the uri already exists.
 */
export async function uriToBufnr(
  denops: Denops,
  uri: string,
): Promise<number> {
  const fname = uriToFname(uri);
  return await fn.bufadd(denops, fname);
}
