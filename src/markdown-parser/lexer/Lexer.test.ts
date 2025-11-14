import { describe, expect, test } from 'vitest';
import { Token } from '../token/Token.ts';
import { tokenType } from '../token/TokenType.ts';
import { Lexer } from './Lexer.ts';

describe('Lexer', () => {
	describe('nextToken ', () => {
		test('will return the next token from the input', () => {
			const lexer = new Lexer('Lorem ipsum');

			expect(lexer.nextToken()).toEqual(
				new Token({
					type: tokenType.TEXT,
					value: 'Lorem',
					position: { line: 1, column: 1, offset: 0 },
				}),
			);
		});

		test('will continue to return the next token till the end', () => {
			const input = `# Markdown syntax guide

## Headers

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_
`;
			const lexer = new Lexer(input);
			const tokens: Token[] = [
				new Token({
					type: tokenType.HASH,
					value: '#',
					position: { line: 1, column: 1, offset: 0 },
				}),
				new Token({
					type: tokenType.WS,
					value: ' ',
					position: { line: 1, column: 2, offset: 1 },
				}),
				new Token({
					type: tokenType.TEXT,
					value: 'Markdown',
					position: { line: 1, column: 3, offset: 2 },
				}),
			];

			for (const token of tokens) {
				expect(lexer.nextToken()).toEqual(token);
			}
		});
	});
});
