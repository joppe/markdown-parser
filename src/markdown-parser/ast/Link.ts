import { InlineElement } from './InlineElement.ts';

export class Link extends InlineElement {
	private _label: InlineElement[];
	private _url: string;
	private _title: string;

	public get label(): InlineElement[] {
		return this._label;
	}

	public get url(): string {
		return this._url;
	}

	public get title(): string {
		return this._title;
	}

	public get tokenLiteral(): string {
		return this._url;
	}

	public constructor(label: InlineElement[], url: string, title = '') {
		super();

		this._label = label;
		this._url = url;
		this._title = title;
	}

	public toString(): string {
		const label = this._label.map((c) => c.toString()).join('');

		return `[link url="${this._url}"]${label}[/link]`;
	}
}
