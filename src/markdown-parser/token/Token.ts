import type { Position } from '../lexer/Position.ts';
import type { TokenType } from './TokenType.ts';

type TokenConstructorProps = {
	type: TokenType;
	value: string;
	position: Position;
};

export class Token {
	private _type: TokenType;
	private _value: string;
	private _position: Position;

	public get type(): TokenType {
		return this._type;
	}

	public get value(): string {
		return this._value;
	}

	public get position(): Position {
		return this._position;
	}

	public constructor({ type, value, position }: TokenConstructorProps) {
		this._type = type;
		this._value = value;
		this._position = position;
	}

	public toString(): string {
		return `Token(${this._type}, ${this._value})`;
	}
}
