import type { BlockElement } from '../ast/BlockElement.ts';
import { Document } from '../ast/Document.ts';
import type { Lexer } from '../lexer/Lexer.ts';
import { BlockParser } from './BlockParser.ts';
import { InlineParser } from './InlineParser.ts';

export class Parser {
	private _blockParser: BlockParser;

	public constructor(lexer: Lexer) {
		const inlineParser = new InlineParser();

		this._blockParser = new BlockParser(lexer, inlineParser);
	}

	public parseDocument(): Document {
		const elements: BlockElement[] = [];

		while (true) {
			const block = this._blockParser.parseBlock();

			if (block) {
				elements.push(block);
			} else {
				break;
			}
		}

		return new Document(elements);
	}
}
