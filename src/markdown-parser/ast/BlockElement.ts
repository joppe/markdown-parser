import type { InlineElement } from './InlineElement.ts';
import { Node } from './Node.ts';

export abstract class BlockElement extends Node {
	protected _children: InlineElement[];

	public get children(): InlineElement[] {
		return this._children;
	}

	public constructor(children: InlineElement[]) {
		super();

		this._children = children;
	}

	public get tokenLiteral(): string {
		if (this._children.length === 0) {
			return '';
		}

		return (this._children[0] as InlineElement).tokenLiteral;
	}

	public toString(): string {
		return `${this._children.map((child) => child.toString()).join('\n')}`;
	}
}
