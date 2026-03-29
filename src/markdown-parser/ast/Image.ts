import { InlineElement } from './InlineElement.ts';

export class Image extends InlineElement {
	private _alt: string;
	private _url: string;
	private _title: string;

	public get alt(): string {
		return this._alt;
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

	public constructor(alt: string, url: string, title = '') {
		super();

		this._alt = alt;
		this._url = url;
		this._title = title;
	}

	public toString(): string {
		return `[img alt="${this._alt}" url="${this._url}"]`;
	}
}
