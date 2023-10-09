import { Snippet } from "./vscode.ts";
export { Snippet as Parser };

/**
 * Parse snippet body
 */
export function parseSnippet(body: string): string {
  const { parsed, value } = Snippet(body, 0);
  if (parsed) {
    return value.getText();
  }
  return "";
}
