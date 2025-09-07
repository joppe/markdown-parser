import type { BlockElement } from './BlockElement.ts';

export class Document {
	private _children: BlockElement[];

	public get children(): BlockElement[] {
		return this._children;
	}

	public constructor(children: BlockElement[]) {
		this._children = children;
	}
}
