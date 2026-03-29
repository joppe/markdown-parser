import { ContainerBlock } from './ContainerBlock.ts';
import type { ListItem } from './ListItem.ts';

export class List extends ContainerBlock {
	private _isOrdered: boolean;
	private _start: number;

	public get isOrdered(): boolean {
		return this._isOrdered;
	}

	public get start(): number {
		return this._start;
	}

	public constructor(items: ListItem[], ordered: boolean, start = 1) {
		super(items);

		this._isOrdered = ordered;
		this._start = start;
	}

	public override toString(): string {
		const tag = this._isOrdered ? 'ol' : 'ul';

		return `[${tag}]${super.toString()}[/${tag}]`;
	}
}
