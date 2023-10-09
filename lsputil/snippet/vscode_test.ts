import { assertEquals } from "../deps.ts";
import { Snippet } from "./vscode.ts";
import * as N from "./node.ts";

Deno.test("text", () => {
  const { parsed, value } = Snippet("foo", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([new N.Text("foo")]),
  );
});

Deno.test("tabstop", () => {
  const { parsed, value } = Snippet("$1 foo", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Tabstop(1),
      new N.Text(" foo"),
    ]),
  );
});

Deno.test("placeholder", () => {
  const { parsed, value } = Snippet("${1:foo} bar", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Placeholder(1, [new N.Text("foo")]),
      new N.Text(" bar"),
    ]),
  );
});

Deno.test("choice", () => {
  const { parsed, value } = Snippet("${1|foo,bar|} baz", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Choice(1, ["foo", "bar"]),
      new N.Text(" baz"),
    ]),
  );
});

Deno.test("variable", () => {
  const { parsed, value } = Snippet("${TM_FILENAME} baz", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Variable("TM_FILENAME"),
      new N.Text(" baz"),
    ]),
  );
});

Deno.test("transform", () => {
  const { parsed, value } = Snippet("${TM_FILENAME/[\\.]/_/} foo", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Variable(
        "TM_FILENAME",
        new N.Transform("[\\.]", [new N.Text("_")]),
      ),
      new N.Text(" foo"),
    ]),
  );
});

Deno.test("format", () => {
  const { parsed, value } = Snippet("${TM_FILENAME/(.*)/${1:/upcase}/} foo", 0);
  assertEquals(parsed, true);
  assertEquals(
    value,
    new N.Snippet([
      new N.Variable(
        "TM_FILENAME",
        new N.Transform("(.*)", [new N.Format(1, "upcase")]),
      ),
      new N.Text(" foo"),
    ]),
  );
});
