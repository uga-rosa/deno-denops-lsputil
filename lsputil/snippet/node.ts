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
