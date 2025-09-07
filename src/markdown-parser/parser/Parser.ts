import type { BlockElement } from '../ast/BlockElement.ts';
import { Document } from '../ast/Document.ts';
import { Paragraph } from '../ast/Paragraph.ts';
import type { Lexer } from '../lexer/Lexer.ts';
import type { Token } from '../token/Token.ts';
import { tokenType } from '../token/TokenType.ts';

const BUFFER_SIZE = 7;

export class Parser {
	private _lexer: Lexer;
	private _lookahead: Token[];
	private _pointer: number;

	public constructor(lexer: Lexer) {
		this._lexer = lexer;
		this._lookahead = [];
		this._pointer = 0;

		for (let _ = 0; _ < BUFFER_SIZE; _ += 1) {
			this.nextToken();
		}
	}
	public parseDocument(): Document {
		const elements: BlockElement[] = [];

		while (this.currentToken().tokenType !== tokenType.EOF) {
			elements.push(this.parseBlock());

			this.nextToken();
		}

		return new Document(elements);
	}

	private parseBlock(): BlockElement {
		return new Paragraph([]);
	}

	private currentToken(): Token {
		return this.peekToken(1);
	}

	private peekToken(offset: number): Token {
		const index = (this._pointer + offset) % BUFFER_SIZE;

		return this._lookahead[index] as Token;
	}

	private nextToken(): void {
		this._lookahead[this._pointer] = this._lexer.nextToken();
		this._pointer = (this._pointer + 1) % BUFFER_SIZE;
	}
}
