import type { InlineElement } from './InlineElement.ts';
import { LeafBlock } from './LeafBlock.ts';

export class Heading extends LeafBlock {
	private _level: number;

	public get level(): number {
		return this._level;
	}

	public constructor(level: number, children: InlineElement[]) {
		super(children);

		this._level = level;
	}

	public override toString(): string {
		return `[h ${this._level}]${super.toString()}[/h]`;
	}
}
