export const SPECIAL_CHARS = [
	'#',
	'*',
	'_',
	'`',
	'[',
	']',
	'(',
	')',
	'!',
	'>',
	'-',
	'+',
	'.',
	'~',
	'<',
	'\\',
];

export function isSpecialChar(char: string): boolean {
	return SPECIAL_CHARS.includes(char);
}
