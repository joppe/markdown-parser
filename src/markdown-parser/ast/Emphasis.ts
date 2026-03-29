import { InlineElement } from './InlineElement.ts';

export class Emphasis extends InlineElement {
	private _children: InlineElement[];

	public get children(): InlineElement[] {
		return this._children;
	}

	public get tokenLiteral(): string {
		return this._children[0]?.tokenLiteral ?? '';
	}

	public constructor(children: InlineElement[]) {
		super();

		this._children = children;
	}

	public toString(): string {
		return `[em]${this._children.map((c) => c.toString()).join('')}[/em]`;
	}
}
