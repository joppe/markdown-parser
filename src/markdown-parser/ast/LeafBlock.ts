import { BlockElement } from './BlockElement.ts';
import type { InlineElement } from './InlineElement.ts';

export abstract class LeafBlock extends BlockElement {
	protected _children: InlineElement[];

	public get children(): InlineElement[] {
		return this._children;
	}

	public constructor(children: InlineElement[]) {
		super();

		this._children = children;
	}

	public get tokenLiteral(): string {
		return this._children[0]?.tokenLiteral ?? '';
	}

	public toString(): string {
		return this._children.map((c) => c.toString()).join('');
	}
}
