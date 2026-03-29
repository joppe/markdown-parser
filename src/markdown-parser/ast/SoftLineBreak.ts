import { InlineElement } from './InlineElement.ts';

export class SoftLineBreak extends InlineElement {
	public get tokenLiteral(): string {
		return '\n';
	}

	public toString(): string {
		return ' ';
	}
}
