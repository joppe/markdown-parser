import { ContainerBlock } from './ContainerBlock.ts';

export class ListItem extends ContainerBlock {
	public override toString(): string {
		return `[li]${super.toString()}[/li]`;
	}
}
