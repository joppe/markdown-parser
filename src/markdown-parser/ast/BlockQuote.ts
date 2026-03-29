import { ContainerBlock } from './ContainerBlock.ts';

export class BlockQuote extends ContainerBlock {
	public override toString(): string {
		return `[blockquote]${super.toString()}[/blockquote]`;
	}
}
