import { Token } from '../token/Token.ts';
import { tokenType } from '../token/TokenType.ts';
import { isDigit } from './isDigit.ts';
import { EOF } from './isEndOfFile.ts';
import { isNewline } from './isNewline.ts';
import { isSpecialChar } from './isSpecialChar.ts';
import { isWhitespace } from './isWhitespace.ts';
import type { Position } from './Position.ts';

export class Lexer {
	private input: string;
	private position: number;
	private line: number;
	private column: number;

	public constructor(input: string) {
		this.input = input;
		this.position = 0;
		this.line = 1;
		this.column = 1;
	}

	public getCurrentPosition(): Position {
		return {
			line: this.line,
			column: this.column,
			offset: this.position,
		};
	}

	private peek(offset = 0): string {
		const pos = this.position + offset;

		if (pos < this.input.length) {
			return this.input[pos] as string;
		}

		return EOF;
	}

	private advance(): string {
		if (this.position >= this.input.length) {
			return EOF;
		}

		const char = this.input[this.position] as string;

		this.position += 1;

		if (char === '\n') {
			this.line += 1;
			this.column = 1;
		} else {
			this.column += 1;
		}

		return char;
	}

	private readNumber(): string {
		let result = '';

		while (isDigit(this.peek())) {
			result += this.advance();
		}

		return result;
	}

	private readText(): string {
		let result = '';

		while (this.position < this.input.length) {
			const char = this.peek();

			if (isNewline(char) || isWhitespace(char) || isSpecialChar(char)) {
				break;
			}

			result += this.advance();
		}

		return result;
	}

	public nextToken(): Token {
		const char = this.peek();
		const position = this.getCurrentPosition();

		if (isNewline(char)) {
			return new Token({
				type: tokenType.EOL,
				value: this.advance(),
				position,
			});
		}

		if (isWhitespace(char)) {
			return new Token({
				type: tokenType.WS,
				value: this.advance(),
				position,
			});
		}

		if (char === EOF) {
			return new Token({
				type: tokenType.EOF,
				value: '',
				position,
			});
		}

		switch (char) {
			case '#':
				return new Token({
					type: tokenType.HASH,
					value: this.advance(),
					position,
				});
			case '*':
				return new Token({
					type: tokenType.ASTERISK,
					value: this.advance(),
					position,
				});
			case '_':
				return new Token({
					type: tokenType.UNDERSCORE,
					value: this.advance(),
					position,
				});
			case '`':
				return new Token({
					type: tokenType.BACKTICK,
					value: this.advance(),
					position,
				});
			case '[':
				return new Token({
					type: tokenType.LBRACKET,
					value: this.advance(),
					position,
				});
			case ']':
				return new Token({
					type: tokenType.RBRACKET,
					value: this.advance(),
					position,
				});
			case '(':
				return new Token({
					type: tokenType.LPAREN,
					value: this.advance(),
					position,
				});
			case ')':
				return new Token({
					type: tokenType.RPAREN,
					value: this.advance(),
					position,
				});
			case '!':
				return new Token({
					type: tokenType.EXCLAMATION,
					value: this.advance(),
					position,
				});
			case '<':
				return new Token({
					type: tokenType.LT,
					value: this.advance(),
					position,
				});
			case '>':
				return new Token({
					type: tokenType.GT,
					value: this.advance(),
					position,
				});
			case '-':
				return new Token({
					type: tokenType.DASH,
					value: this.advance(),
					position,
				});
			case '+':
				return new Token({
					type: tokenType.PLUS,
					value: this.advance(),
					position,
				});
			case '.':
				return new Token({
					type: tokenType.DOT,
					value: this.advance(),
					position,
				});
			case '~':
				return new Token({
					type: tokenType.TILDE,
					value: this.advance(),
					position,
				});
			case '\\':
				return new Token({
					type: tokenType.BACKSLASH,
					value: this.advance(),
					position,
				});
			default: {
				if (isDigit(char)) {
					return new Token({
						type: tokenType.NUMBER,
						value: this.readNumber(),
						position,
					});
				}

				return new Token({
					type: tokenType.TEXT,
					value: this.readText(),
					position,
				});
			}
		}
	}
}
