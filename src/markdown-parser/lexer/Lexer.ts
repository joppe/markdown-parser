import { Token } from '../token/Token.ts';
import { tokenType } from '../token/TokenType.ts';

const EOF = '\u{0}';

export class Lexer {
	private input: string;
	private position: number;
	private readPosition: number;
	private char: string;

	public constructor(input: string) {
		this.input = input;
		this.position = 0;
		this.readPosition = 0;
		this.char = EOF;

		this.readChar();
	}

	public nextToken(): Token {
		let token: Token;

		switch (this.char) {
			case ' ':
				token = new Token(tokenType.WS, this.char);
				break;
			case '\n':
				token = new Token(tokenType.EOL, this.char);
				break;
			case '#':
				token = new Token(tokenType.Hash, this.char);
				break;
			case '*':
				token = new Token(tokenType.Asterisk, this.char);
				break;
			case '>':
				token = new Token(tokenType.Gt, this.char);
				break;
			case '.':
				token = new Token(tokenType.Dot, this.char);
				break;
			case '-':
				token = new Token(tokenType.Dash, this.char);
				break;
			case '_':
				token = new Token(tokenType.Underscore, this.char);
				break;
			case '~':
				token = new Token(tokenType.Tilde, this.char);
				break;
			case '`':
				token = new Token(tokenType.Backtick, this.char);
				break;
			case '[':
				token = new Token(tokenType.LBracket, this.char);
				break;
			case ']':
				token = new Token(tokenType.RBracket, this.char);
				break;
			case '(':
				token = new Token(tokenType.LParen, this.char);
				break;
			case ')':
				token = new Token(tokenType.RParen, this.char);
				break;
			case '!':
				token = new Token(tokenType.Exclamation, this.char);
				break;
			case EOF:
				token = new Token(tokenType.EOF, this.char);
				break;
			default:
				if (isDigit(this.char)) {
					return new Token(tokenType.Int, this.readNumber());
				}

				return new Token(tokenType.Str, this.readString());
		}

		this.readChar();

		return token;
	}

	private readNumber(): string {
		const position = this.position;

		while (isDigit(this.char)) {
			this.readChar();
		}

		return this.input.slice(position, this.position);
	}

	private readString(): string {
		const position = this.position;

		while (
			!isInlineToken(this.char) &&
			this.char !== EOF &&
			this.char !== '\n'
		) {
			this.readChar();
		}

		return this.input.slice(position, this.position);
	}

	private readChar(): void {
		if (this.readPosition >= this.input.length) {
			this.char = EOF;
		} else {
			this.char = this.input[this.readPosition] as string;
		}

		this.position = this.readPosition;
		this.readPosition += 1;
	}
}

function isDigit(char: string): boolean {
	return char.match(/\d/) !== null;
}

const INLINE_TOKENS = ['*', '_', '~', '`', '[', ']', '(', ')', '!'];

function isInlineToken(char: string): boolean {
	return INLINE_TOKENS.includes(char);
}
