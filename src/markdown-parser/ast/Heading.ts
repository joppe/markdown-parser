import type { Token } from '../token/Token.ts';
import { BlockElement } from './BlockElement.ts';
import type { InlineElement } from './InlineElement.ts';

export class Heading extends BlockElement {
	private _level: number;

	public get level(): number {
		return this._level;
	}

	public constructor(token: Token, level: number, children: InlineElement[]) {
		super(token, children);

		this._level = level;
	}

	public override toString(): string {
		return `[h ${this._level}]${super.toString()}[/h]`;
	}
}
