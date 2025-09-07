import { describe, expect, test } from 'vitest';
import { Document } from '../ast/Document.ts';
import { Lexer } from '../lexer/Lexer.ts';
import { Parser } from './Parser.ts';

describe('Parser', () => {
	describe('nextToken ', () => {
		test('will return the next token from the input', () => {
			const lexer = new Lexer('Lorem ipsum');
			const parser = new Parser(lexer);

			expect(parser.parseDocument()).toEqual(new Document([]));
		});
	});
});
