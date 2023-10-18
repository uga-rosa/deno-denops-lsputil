import { Denops, fn, fromFileUrl, toFileUrl } from "../deps.ts";

export function uriFromFname(
  fname: string,
): string {
  return toFileUrl(fname).toString();
}

export async function uriFromBufnr(
  denops: Denops,
  bufnr: number,
): Promise<string> {
  bufnr = bufnr > 0 ? bufnr : await fn.bufnr(denops);
  const fname = await denops.eval(
    `fnamemodify(bufname(${bufnr}), ':p')`,
  ) as string;
  return uriFromFname(fname);
}

export function uriToFname(
  uri: string,
): string {
  return fromFileUrl(uri);
}

export async function uriToBufnr(
  denops: Denops,
  uri: string,
): Promise<number> {
  const fname = uriToFname(uri);
  return await fn.bufadd(denops, fname);
}
