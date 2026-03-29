import { BlockElement } from './BlockElement.ts';

export abstract class ContainerBlock extends BlockElement {
	protected _children: BlockElement[];

	public get children(): BlockElement[] {
		return this._children;
	}

	public get tokenLiteral(): string {
		return this._children[0]?.tokenLiteral ?? '';
	}

	public constructor(children: BlockElement[]) {
		super();

		this._children = children;
	}

	public toString(): string {
		return this._children.map((c) => c.toString()).join('\n');
	}
}
