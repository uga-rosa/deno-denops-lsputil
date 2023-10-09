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

export abstract class Node {
  abstract type: NodeType;
}

export class Snippet extends Node {
  type: "snippet" = "snippet";

  constructor(
    public children: (
      | Tabstop
      | Placeholder
      | Choice
      | Variable
      | Text
    )[],
  ) {
    super();
  }

  getText(): string {
    return this.children.map((n) => n.getText()).join("");
  }
}

export class Tabstop extends Node {
  type: "tabstop" = "tabstop";

  constructor(
    public tabstop: number,
    public transform?: Transform,
  ) {
    super();
  }

  getText(): string {
    return "";
  }
}

export class Placeholder extends Node {
  type: "placeholder" = "placeholder";

  constructor(
    public tabstop: number,
    public children?: Snippet["children"],
  ) {
    super();
  }

  getText(): string {
    return this.children?.map((n) => n.getText()).join("") ?? "";
  }
}

export class Choice extends Node {
  type: "choice" = "choice";

  constructor(
    public tabstop: number,
    public items: string[],
  ) {
    super();
  }

  getText(): string {
    return this.items[0];
  }
}

export class Variable extends Node {
  type: "variable" = "variable";

  constructor(
    public name: string,
    public transform?: Transform,
    public children?: Snippet["children"],
  ) {
    super();
  }

  getText(): string {
    return "";
  }
}

export class Transform extends Node {
  type: "transform" = "transform";

  constructor(
    public pattern: string,
    public formats: (Format | Text)[],
    public options?: string,
  ) {
    super();
  }
}

export class Format extends Node {
  type: "format" = "format";

  constructor(
    public captureIndex: number,
    public modifier?: FormatModifier,
    public ifText?: string,
    public elseText?: string,
  ) {
    super();
  }
}

export class Text extends Node {
  type: "text" = "text";

  constructor(
    public text: string,
  ) {
    super();
  }

  getText(): string {
    return this.text;
  }
}
