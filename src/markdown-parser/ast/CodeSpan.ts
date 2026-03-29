import { InlineElement } from './InlineElement.ts';

export class CodeSpan extends InlineElement {
	private _content: string;

	public get content(): string {
		return this._content;
	}

	public get tokenLiteral(): string {
		return this._content;
	}

	public constructor(content: string) {
		super();

		this._content = content;
	}

	public toString(): string {
		return `[code]${this._content}[/code]`;
	}
}
