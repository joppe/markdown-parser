export const EOF = '\u{0}';

export function isEndOfFile(char: string): boolean {
	return char === EOF;
}
