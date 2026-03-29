import { LeafBlock } from './LeafBlock.ts';

export class ThematicBreak extends LeafBlock {
	public constructor() {
		super([]);
	}

	public override get tokenLiteral(): string {
		return '---';
	}

	public override toString(): string {
		return '[hr]';
	}
}
