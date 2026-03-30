import {
	type BlockElement,
	BlockQuote,
	CodeBlock,
	Heading,
	List,
	ListItem,
	Paragraph,
	Text,
	ThematicBreak,
} from '../ast/index.ts';
import type { Lexer } from '../lexer/index.ts';
import { type Token, tokenType } from '../token/index.ts';
import type { InlineParser } from './InlineParser.ts';

const BUFFER_SIZE = 7;

export class BlockParser {
	private _lexer: Lexer;
	private _lookahead: Token[];
	private _pointer: number;
	private _inlineParser: InlineParser;

	public constructor(lexer: Lexer, inlineParser: InlineParser) {
		this._lexer = lexer;
		this._lookahead = [];
		this._pointer = 0;
		this._inlineParser = inlineParser;

		for (let _ = 0; _ < BUFFER_SIZE; _ += 1) {
			this.nextToken();
		}
	}

	public parseBlock(): BlockElement | null {
		// Skip blank lines but not leading whitespace (needed for indented code blocks)
		while (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		if (this.currentToken().type === tokenType.EOF) {
			return null;
		}

		// Count leading spaces for indentation
		const indentation = this.countLeadingSpaces();

		// Indented code block (4+ spaces)
		if (indentation >= 4) {
			return this.parseIndentedCodeBlock();
		}

		// ATX heading (# Heading)
		if (this.currentToken().type === tokenType.HASH && indentation <= 3) {
			return this.parseATXHeading();
		}

		// Thematic break (---, ***, ___)
		if (this.isThematicBreak()) {
			return this.parseThematicBreak();
		}

		// Fenced code block (```)
		if (
			this.currentToken().type === tokenType.BACKTICK ||
			this.currentToken().type === tokenType.TILDE
		) {
			const fencedBlock = this.parseFencedCodeBlock();

			if (fencedBlock) {
				return fencedBlock;
			}
		}

		// Block quote (>)
		if (this.currentToken().type === tokenType.GT && indentation <= 3) {
			return this.parseBlockQuote();
		}

		// List item (-, +, *, or number.)
		if (this.isListMarker() && indentation <= 3) {
			return this.parseList();
		}

		// Paragraph (default)
		return this.parseParagraph();
	}

	private parseATXHeading(): Heading | Paragraph {
		let level = 0;
		const startToken = this.currentToken();

		// Count # characters (1-6)
		while (
			this.currentToken().type === tokenType.HASH &&
			level < 6 &&
			this.currentToken().position.line === startToken.position.line
		) {
			level += 1;
			this.nextToken();
		}

		// Must be followed by space/tab or EOL
		if (
			this.currentToken().type !== tokenType.WS &&
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			// Not a valid heading, parse as paragraph
			return this.parseParagraph('#'.repeat(level).split(''));
		}

		// Skip whitespace
		this.skipWhitespace();

		// Collect heading content until EOL
		const content: string[] = [];

		while (
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			content.push(this.currentToken().value);

			this.nextToken();
		}

		// Remove trailing # characters and whitespace
		let text = content.join('');
		text = text.replace(/\s*#+\s*$/, '').trim();

		// Parse inline content
		const inlines = this._inlineParser.parseInlineContent(text);

		// Skip to next line
		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		return new Heading(level, inlines);
	}

	private parseThematicBreak(): ThematicBreak {
		// Skip the thematic break line
		while (
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			this.nextToken();
		}

		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		return new ThematicBreak();
	}

	private parseIndentedCodeBlock(): CodeBlock {
		const lines: string[] = [];

		while (this.currentToken().type !== tokenType.EOF) {
			const indentation = this.countLeadingSpaces();

			if (indentation < 4 && !this.isBlankLine()) {
				break;
			}

			// Skip 4 spaces of indentation
			for (let i = 0; i < Math.min(4, indentation); i++) {
				this.nextToken();
			}

			// Collect line content
			const line: string[] = [];
			while (
				this.currentToken().type !== tokenType.EOL &&
				this.currentToken().type !== tokenType.EOF
			) {
				line.push(this.currentToken().value);
				this.nextToken();
			}

			lines.push(line.join(''));

			if (this.currentToken().type === tokenType.EOL) {
				this.nextToken();
			}
		}

		return new CodeBlock(lines.join('\n'));
	}

	private parseFencedCodeBlock(): CodeBlock | null {
		const fenceChar = this.currentToken().type;
		const startLine = this.currentToken().position.line;

		// Count fence characters (must be 3+)
		let fenceCount = 0;
		while (this.currentToken().type === fenceChar) {
			fenceCount += 1;
			this.nextToken();
		}

		if (fenceCount < 3) {
			return null;
		}

		// Get info string (language)
		this.skipWhitespace();
		const infoTokens: string[] = [];
		while (
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			infoTokens.push(this.currentToken().value);
			this.nextToken();
		}

		const language = infoTokens.join('').trim();

		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		// Collect code content
		const lines: string[] = [];
		while (this.currentToken().type !== tokenType.EOF) {
			// Check for closing fence
			if (this.currentToken().type === fenceChar) {
				let closeFenceCount = 0;
				const checkPointer = this._pointer;
				while (this.currentToken().type === fenceChar) {
					closeFenceCount += 1;
					this.nextToken();
				}

				if (closeFenceCount >= fenceCount) {
					// Skip to end of line
					while (
						this.currentToken().type !== tokenType.EOL &&
						this.currentToken().type !== tokenType.EOF
					) {
						this.nextToken();
					}
					if (this.currentToken().type === tokenType.EOL) {
						this.nextToken();
					}
					break;
				}
			}

			// Collect line
			const line: string[] = [];
			while (
				this.currentToken().type !== tokenType.EOL &&
				this.currentToken().type !== tokenType.EOF
			) {
				line.push(this.currentToken().value);
				this.nextToken();
			}

			lines.push(line.join(''));

			if (this.currentToken().type === tokenType.EOL) {
				lines.push('\n');
				this.nextToken();
			}
		}

		return new CodeBlock(lines.join('').replace(/\n$/, ''), language);
	}

	private parseBlockQuote(): BlockQuote {
		const blocks: BlockElement[] = [];

		while (this.currentToken().type !== tokenType.EOF) {
			// Check if line starts with >
			this.skipWhitespace();

			if (this.currentToken().type !== tokenType.GT) {
				if (!this.isBlankLine()) {
					break;
				}
				// Skip blank line
				if (this.currentToken().type === tokenType.EOL) {
					this.nextToken();
				}
				continue;
			}

			// Skip >
			this.nextToken();

			// Skip optional space after >
			if (this.currentToken().type === tokenType.WS) {
				this.nextToken();
			}

			// Parse the rest of the line as a block
			const block = this.parseBlock();
			if (block) {
				blocks.push(block);
			}
		}

		return new BlockQuote(blocks);
	}

	private parseList(): List {
		const items: ListItem[] = [];
		let ordered = false;
		let start = 1;

		// Determine list type from first marker
		if (this.currentToken().type === tokenType.NUMBER) {
			ordered = true;
			start = Number.parseInt(this.currentToken().value, 10);
		}

		while (this.currentToken().type !== tokenType.EOF) {
			this.skipWhitespace();

			if (!this.isListMarker()) {
				break;
			}

			// Parse list item
			const item = this.parseListItem(ordered);
			items.push(item);
		}

		return new List(items, ordered, start);
	}

	private parseListItem(ordered: boolean): ListItem {
		// Skip list marker
		if (ordered) {
			this.nextToken(); // number
			if (this.currentToken().type === tokenType.DOT) {
				this.nextToken(); // dot
			}
		} else {
			this.nextToken(); // -, +, or *
		}

		// Skip whitespace after marker
		this.skipWhitespace();

		// Collect content until next list item or blank line
		const blocks: BlockElement[] = [];
		const contentTokens: string[] = [];

		while (
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			contentTokens.push(this.currentToken().value);
			this.nextToken();
		}

		if (contentTokens.length > 0) {
			const inlines = this._inlineParser.parseInlineContent(
				contentTokens.join(''),
			);
			blocks.push(new Paragraph(inlines));
		}

		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		return new ListItem(blocks);
	}

	private parseParagraph(startTokens: string[] = []): Paragraph | Heading {
		const lines: string[] = [];
		const firstLineTokens: string[] = startTokens;

		// Collect first line
		while (
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			firstLineTokens.push(this.currentToken().value);
			this.nextToken();
		}

		lines.push(firstLineTokens.join(''));

		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		// Check if next line is setext underline
		const setextHeading = this.checkSetextUnderline();
		if (setextHeading !== null && lines[0]) {
			const text = lines[0].trim();
			const inlines = this._inlineParser.parseInlineContent(text);
			return new Heading(setextHeading, inlines);
		}

		// Continue collecting paragraph lines
		while (this.currentToken().type !== tokenType.EOF) {
			// Check for blank line (ends paragraph)
			if (this.isBlankLine()) {
				if (this.currentToken().type === tokenType.EOL) {
					this.nextToken();
				}
				break;
			}

			// Check for start of other block elements
			const indentation = this.countLeadingSpaces();
			if (indentation === 0) {
				if (
					this.currentToken().type === tokenType.HASH ||
					this.isThematicBreak() ||
					this.currentToken().type === tokenType.GT ||
					this.isListMarker()
				) {
					break;
				}
			}

			// Collect line content
			const line: string[] = [];
			while (
				this.currentToken().type !== tokenType.EOL &&
				this.currentToken().type !== tokenType.EOF
			) {
				line.push(this.currentToken().value);
				this.nextToken();
			}

			lines.push(line.join(''));

			if (this.currentToken().type === tokenType.EOL) {
				this.nextToken();
			}
		}

		const text = lines.join(' ').trim();
		const inlines = this._inlineParser.parseInlineContent(text);

		return new Paragraph(inlines);
	}

	private checkSetextUnderline(): number | null {
		// Check indentation (must be 0-3 spaces)
		const indentation = this.countLeadingSpaces();

		if (indentation > 3) {
			return null;
		}

		// Skip leading whitespace
		for (let i = 0; i < indentation; i++) {
			this.nextToken();
		}

		// Check for underline character (= or -)
		const token = this.currentToken();

		if (token.type !== tokenType.DASH && token.type !== tokenType.EQUALS) {
			return null;
		}

		const underlineChar = token.type;
		const level = underlineChar === tokenType.EQUALS ? 1 : 2;
		const startLine = token.position.line;
		let count = 0;

		// Consume underline characters and whitespace on this line
		while (
			this.currentToken().position.line === startLine &&
			this.currentToken().type !== tokenType.EOL &&
			this.currentToken().type !== tokenType.EOF
		) {
			const t = this.currentToken();

			if (t.type === underlineChar) {
				count += 1;
				this.nextToken();
			} else if (t.type === tokenType.WS) {
				this.nextToken();
			} else {
				// Invalid - contains non-whitespace, non-underline characters
				return null;
			}
		}

		// Need at least one underline character
		if (count === 0) {
			return null;
		}

		// Skip EOL if present
		if (this.currentToken().type === tokenType.EOL) {
			this.nextToken();
		}

		return level;
	}

	// Helper methods

	private isThematicBreak(): boolean {
		const char = this.currentToken().type;

		if (
			char !== tokenType.DASH &&
			char !== tokenType.ASTERISK &&
			char !== tokenType.UNDERSCORE
		) {
			return false;
		}

		let count = 0;
		let i = 0;
		const startLine = this.currentToken().position.line;

		while (true) {
			const token = this.peekToken(i);

			if (token.position.line !== startLine) {
				break;
			}

			if (token.type === tokenType.EOL || token.type === tokenType.EOF) {
				break;
			}

			if (token.type === char) {
				count += 1;
			} else if (token.type !== tokenType.WS) {
				return false;
			}

			i += 1;
		}

		return count >= 3;
	}

	private isListMarker(): boolean {
		const token = this.currentToken();

		// Unordered list markers
		if (
			token.type === tokenType.DASH ||
			token.type === tokenType.PLUS ||
			token.type === tokenType.ASTERISK
		) {
			const next = this.peekToken(1);

			return next.type === tokenType.WS || next.type === tokenType.EOL;
		}

		// Ordered list markers
		if (token.type === tokenType.NUMBER) {
			const next = this.peekToken(1);

			if (next.type === tokenType.DOT) {
				const afterDot = this.peekToken(2);

				return (
					afterDot.type === tokenType.WS || afterDot.type === tokenType.EOL
				);
			}
		}

		return false;
	}

	private isBlankLine(): boolean {
		let i = 0;
		const startLine = this.currentToken().position.line;

		while (true) {
			const token = this.peekToken(i);

			if (token.position.line !== startLine) {
				break;
			}

			if (token.type === tokenType.EOL || token.type === tokenType.EOF) {
				return true;
			}

			if (token.type !== tokenType.WS) {
				return false;
			}

			i += 1;
		}

		return true;
	}

	private countLeadingSpaces(): number {
		let count = 0;
		let i = 0;
		const startLine = this.currentToken().position.line;

		while (true) {
			const token = this.peekToken(i);

			if (token.position.line !== startLine || token.type !== tokenType.WS) {
				break;
			}

			count += 1;
			i += 1;
		}

		return count;
	}

	private skipWhitespace(): void {
		while (this.currentToken().type === tokenType.WS) {
			this.nextToken();
		}
	}

	private currentToken(): Token {
		return this.peekToken(0);
	}

	private peekToken(offset: number): Token {
		const index = (this._pointer + offset) % BUFFER_SIZE;

		return this._lookahead[index] as Token;
	}

	private nextToken(): void {
		this._lookahead[this._pointer] = this._lexer.nextToken();
		this._pointer = (this._pointer + 1) % BUFFER_SIZE;
	}
}
