import { assertEquals } from "../deps.ts";
import { parseSnippet } from "./mod.ts";

Deno.test("text", () => {
  const parsed = parseSnippet("foo");
  assertEquals(parsed, "foo");
});

Deno.test("tabstop", () => {
  const parsed = parseSnippet("$1 foo");
  assertEquals(parsed, " foo");
});

Deno.test("placeholder", () => {
  const parsed = parseSnippet("${1:foo} bar");
  assertEquals(parsed, "foo bar");
});

Deno.test("choice", () => {
  const parsed = parseSnippet("${1|foo,bar|} baz");
  assertEquals(parsed, "foo baz");
});

Deno.test("variable", () => {
  const parsed = parseSnippet("${TM_FILENAME} baz");
  assertEquals(parsed, " baz");
});

Deno.test("transform", () => {
  const parsed = parseSnippet("${TM_FILENAME/[\\.]/_/} foo");
  assertEquals(parsed, " foo");
});

Deno.test("format", () => {
  const parsed = parseSnippet("${TM_FILENAME/(.*)/${1:/upcase}/} foo");
  assertEquals(parsed, " foo");
});
