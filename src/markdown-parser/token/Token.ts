import type { TokenType } from './TokenType.ts';

class Token {
	private _tokenType: TokenType;
	private _literal: string;

	public get tokenType(): TokenType {
		return this._tokenType;
	}

	public get literal(): string {
		return this._literal;
	}

	public constructor(tokenType: TokenType, literal: string) {
		this._tokenType = tokenType;
		this._literal = literal;
	}

	public toString(): string {
		return `Token(${this._tokenType}, ${this._literal})`;
	}
}

export { Token };
