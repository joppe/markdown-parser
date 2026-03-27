export const SPACE = ' ';
export const TAB = '\t';

export function isWhitespace(char: string): boolean {
	return char === SPACE || char === TAB;
}
