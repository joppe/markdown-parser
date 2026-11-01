export const EOF = "\u0000";

export function isEndOfFile(char: string): boolean {
  return char === EOF;
}
