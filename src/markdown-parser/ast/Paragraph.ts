import { LeafBlock } from './LeafBlock.ts';

export class Paragraph extends LeafBlock {
	public override toString(): string {
		return `[p]${super.toString()}[/p]`;
	}
}
