import { InlineElement } from './InlineElement.ts';

export class HardLineBreak extends InlineElement {
	public get tokenLiteral(): string {
		return '\n';
	}

	public toString(): string {
		return '[br]';
	}
}
