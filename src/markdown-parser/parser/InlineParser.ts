import {
	CodeSpan,
	Emphasis,
	type InlineElement,
	Link,
	Strong,
	Text,
} from '../ast/index.ts';

export class InlineParser {
	public parseInlineContent(text: string): InlineElement[] {
		if (text.trim() === '') {
			return [];
		}

		const inlines: InlineElement[] = [];
		let i = 0;

		while (i < text.length) {
			// Code span (`code`)
			if (text[i] === '`') {
				const result = this.parseCodeSpan(text, i);
				if (result) {
					inlines.push(result.element);
					i = result.newIndex;
					continue;
				}
			}

			// Strong emphasis (**text** or __text__)
			if (
				(text[i] === '*' && text[i + 1] === '*') ||
				(text[i] === '_' && text[i + 1] === '_')
			) {
				const result = this.parseStrongEmphasis(text, i);
				if (result) {
					inlines.push(result.element);
					i = result.newIndex;
					continue;
				}
			}

			// Emphasis (*text* or _text_)
			if (text[i] === '*' || text[i] === '_') {
				const result = this.parseEmphasis(text, i);
				if (result) {
					inlines.push(result.element);
					i = result.newIndex;
					continue;
				}
			}

			// Link/Image ([text](url))
			if (text[i] === '[' || (text[i] === '!' && text[i + 1] === '[')) {
				const result = this.parseLink(text, i);
				if (result) {
					inlines.push(result.element);
					i = result.newIndex;
					continue;
				}
			}

			// Backslash escape
			if (text[i] === '\\' && i + 1 < text.length) {
				const nextChar = text[i + 1];
				if (this.isEscapableChar(nextChar || '')) {
					inlines.push(new Text(nextChar || ''));
					i += 2;
					continue;
				}
			}

			// Regular text
			let textContent = '';
			while (
				i < text.length &&
				!this.isInlineDelimiter(text[i] || '') &&
				text[i] !== '\\'
			) {
				textContent += text[i];
				i += 1;
			}

			if (textContent) {
				inlines.push(new Text(textContent));
			}

			// If we haven't moved forward, advance by one to avoid infinite loop
			if (textContent === '' && text[i]) {
				inlines.push(new Text(text[i] || ''));
				i += 1;
			}
		}

		return inlines;
	}

	private parseCodeSpan(
		text: string,
		start: number,
	): { element: InlineElement; newIndex: number } | null {
		let backtickCount = 0;
		let i = start;

		// Count opening backticks
		while (i < text.length && text[i] === '`') {
			backtickCount += 1;
			i += 1;
		}

		const openingTicks = backtickCount;
		let content = '';
		let closingTicks = 0;

		// Find closing backticks
		while (i < text.length) {
			if (text[i] === '`') {
				closingTicks += 1;
				i += 1;

				if (closingTicks === openingTicks) {
					// Found matching closing
					return {
						element: new CodeSpan(content.trim()),
						newIndex: i,
					};
				}
			} else {
				// Add any accumulated backticks as content
				if (closingTicks > 0) {
					content += '`'.repeat(closingTicks);
					closingTicks = 0;
				}
				content += text[i];
				i += 1;
			}
		}

		// No matching closing found
		return null;
	}

	private parseStrongEmphasis(
		text: string,
		start: number,
	): { element: InlineElement; newIndex: number } | null {
		const delimiter = text[start] === '*' ? '**' : '__';
		let i = start + 2;

		// Find closing delimiter
		while (i < text.length - 1) {
			if (text[i] === delimiter[0] && text[i + 1] === delimiter[1]) {
				const content = text.slice(start + 2, i);
				const children = this.parseInlineContent(content);

				return {
					element: new Strong(children),
					newIndex: i + 2,
				};
			}
			i += 1;
		}

		return null;
	}

	private parseEmphasis(
		text: string,
		start: number,
	): { element: InlineElement; newIndex: number } | null {
		const delimiter = text[start];
		let i = start + 1;

		// Find closing delimiter
		while (i < text.length) {
			if (text[i] === delimiter) {
				const content = text.slice(start + 1, i);
				const children = this.parseInlineContent(content);

				return {
					element: new Emphasis(children),
					newIndex: i + 1,
				};
			}
			i += 1;
		}

		return null;
	}

	private parseLink(
		text: string,
		start: number,
	): { element: InlineElement; newIndex: number } | null {
		let i = start;
		const isImage = text[i] === '!';

		if (isImage) {
			i += 1;
		}

		if (text[i] !== '[') {
			return null;
		}

		i += 1;

		// Find closing ]
		let bracketDepth = 1;
		let labelEnd = -1;
		while (i < text.length && bracketDepth > 0) {
			if (text[i] === '\\' && i + 1 < text.length) {
				i += 2;
				continue;
			}
			if (text[i] === '[') {
				bracketDepth += 1;
			} else if (text[i] === ']') {
				bracketDepth -= 1;
				if (bracketDepth === 0) {
					labelEnd = i;
					break;
				}
			}
			i += 1;
		}

		if (labelEnd === -1 || i >= text.length) {
			return null;
		}

		i = labelEnd + 1;

		// Check for (url)
		if (i < text.length && text[i] === '(') {
			i += 1;

			// Skip whitespace
			while (i < text.length && /\s/.test(text[i] || '')) {
				i += 1;
			}

			// Parse URL
			let url = '';
			while (
				i < text.length &&
				text[i] !== ')' &&
				text[i] !== ' ' &&
				text[i] !== '\t'
			) {
				url += text[i];
				i += 1;
			}

			// Skip whitespace
			while (i < text.length && /\s/.test(text[i] || '')) {
				i += 1;
			}

			// Parse optional title
			let title = '';
			if (
				i < text.length &&
				(text[i] === '"' || text[i] === "'" || text[i] === '(')
			) {
				const quoteChar = text[i] === '(' ? ')' : text[i];
				i += 1;
				while (i < text.length && text[i] !== quoteChar) {
					title += text[i];
					i += 1;
				}
				if (i < text.length) {
					i += 1; // Skip closing quote
				}
			}

			// Skip whitespace
			while (i < text.length && /\s/.test(text[i] || '')) {
				i += 1;
			}

			// Check for closing )
			if (i < text.length && text[i] === ')') {
				i += 1;
				const labelText = text.slice(start + (isImage ? 2 : 1), labelEnd);
				const labelInlines = this.parseInlineContent(labelText);

				return {
					element: new Link(labelInlines, url, title),
					newIndex: i,
				};
			}
		}

		return null;
	}

	private isInlineDelimiter(char: string): boolean {
		return (
			char === '*' ||
			char === '_' ||
			char === '`' ||
			char === '[' ||
			char === ']' ||
			char === '!'
		);
	}

	private isEscapableChar(char: string): boolean {
		return /[\\`*_{}[\]()#+\-.!<>|]/.test(char);
	}
}
