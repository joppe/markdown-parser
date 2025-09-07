import { describe, expect, test } from 'vitest';
import { Token } from '../token/Token.ts';
import { tokenType } from '../token/TokenType.ts';
import { Lexer } from './Lexer.ts';

describe('Lexer', () => {
	describe('nextToken ', () => {
		test('will return the next token from the input', () => {
			const lexer = new Lexer('Lorem ipsum');

			expect(lexer.nextToken()).toEqual(
				new Token(tokenType.Str, 'Lorem ipsum'),
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
			const tokens = [
				new Token(tokenType.Hash, '#'),
				new Token(tokenType.WS, ' '),
				new Token(tokenType.Str, 'Markdown syntax guide'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Hash, '#'),
				new Token(tokenType.Hash, '#'),
				new Token(tokenType.WS, ' '),
				new Token(tokenType.Str, 'Headers'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Str, 'This text will be italic'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.Str, 'This will also be italic'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Str, 'This text will be bold'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.Str, 'This will also be bold'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.Str, 'You '),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Str, 'can'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.Asterisk, '*'),
				new Token(tokenType.WS, ' '),
				new Token(tokenType.Str, 'combine them'),
				new Token(tokenType.Underscore, '_'),
				new Token(tokenType.EOL, '\n'),
				new Token(tokenType.EOF, '\u{0}'),
			];

			for (const token of tokens) {
				expect(lexer.nextToken()).toEqual(token);
			}
		});
	});
});
