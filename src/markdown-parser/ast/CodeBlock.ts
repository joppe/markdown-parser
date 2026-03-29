import { LeafBlock } from './LeafBlock.ts';

export class CodeBlock extends LeafBlock {
	private _content: string;
	private _language: string;

	public get content(): string {
		return this._content;
	}

	public get language(): string {
		return this._language;
	}

	public constructor(content: string, language = '') {
		super([]);

		this._content = content;
		this._language = language;
	}

	public override get tokenLiteral(): string {
		return this._content;
	}

	public override toString(): string {
		const lang = this._language ? ` lang=${this._language}` : '';

		return `[code${lang}]${this._content}[/code]`;
	}
}
