export type NodeType =
  | "snippet"
  | "tabstop"
  | "placeholder"
  | "choice"
  | "variable"
  | "transform"
  | "format"
  | "text";

export type FormatModifier =
  | "upcase"
  | "downcase"
  | "capitalize"
  | "camelcase"
  | "pascalcase";

export type Node =
  | Snippet
  | Tabstop
  | Placeholder
  | Choice
  | Variable
  | Transform
  | Format
  | Text;

export function isSnippet(n: Node): n is Snippet {
  return n.type === "snippet";
}

export function isTabstop(n: Node): n is Tabstop {
  return n.type === "tabstop";
}

export function isPlaceholder(n: Node): n is Placeholder {
  return n.type === "placeholder";
}

export function isChoice(n: Node): n is Choice {
  return n.type === "choice";
}

export function isVariable(n: Node): n is Variable {
  return n.type === "variable";
}

export function isTransform(n: Node): n is Transform {
  return n.type === "transform";
}

export function isFormat(n: Node): n is Format {
  return n.type === "format";
}

export function isText(n: Node): n is Text {
  return n.type === "text";
}

export class Snippet {
  type: "snippet" = "snippet";

  constructor(
    public children: (
      | Tabstop
      | Placeholder
      | Choice
      | Variable
      | Text
    )[],
  ) {}

  getText(): string {
    return this.children.map((n) => n.getText()).join("");
  }
}

export class Tabstop {
  type: "tabstop" = "tabstop";

  constructor(
    public tabstop: number,
    public transform?: Transform,
  ) {}

  getText(): string {
    return "";
  }
}

export class Placeholder {
  type: "placeholder" = "placeholder";

  constructor(
    public tabstop: number,
    public children: Snippet["children"],
  ) {}

  getText(): string {
    return this.children?.map((n) => n.getText()).join("") ?? "";
  }
}

export class Choice {
  type: "choice" = "choice";

  constructor(
    public tabstop: number,
    public items: string[],
  ) {}

  getText(): string {
    return this.items[0];
  }
}

export class Variable {
  type: "variable" = "variable";

  constructor(
    public name: string,
    public transform?: Transform,
    public children?: Snippet["children"],
  ) {}

  getText(): string {
    return "";
  }
}

export class Transform {
  type: "transform" = "transform";

  constructor(
    public pattern: string,
    public formats: (Format | Text)[],
    public options?: string,
  ) {}
}

export class Format {
  type: "format" = "format";

  constructor(
    public captureIndex: number,
    public modifier?: FormatModifier,
    public ifText?: string,
    public elseText?: string,
  ) {}
}

export class Text {
  type: "text" = "text";

  constructor(
    public text: string,
  ) {}

  getText(): string {
    return this.text;
  }
}
