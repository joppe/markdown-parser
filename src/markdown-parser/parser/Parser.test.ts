import { describe, expect, test } from 'vitest';
import { CodeBlock } from '../ast/CodeBlock.ts';
import { CodeSpan } from '../ast/CodeSpan.ts';
import { Document } from '../ast/Document.ts';
import { Emphasis } from '../ast/Emphasis.ts';
import { Heading } from '../ast/Heading.ts';
import { Link } from '../ast/Link.ts';
import { Paragraph } from '../ast/Paragraph.ts';
import { Strong } from '../ast/Strong.ts';
import { Text } from '../ast/Text.ts';
import { ThematicBreak } from '../ast/ThematicBreak.ts';
import { Lexer } from '../lexer/Lexer.ts';
import { Parser } from './Parser.ts';

describe('Parser', () => {
	describe('parseDocument', () => {
		test('parses simple text as paragraph', () => {
			const lexer = new Lexer('Lorem ipsum');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			expect(doc.children[0]).toBeInstanceOf(Paragraph);
			const para = doc.children[0] as Paragraph;
			expect(para.children[0]).toBeInstanceOf(Text);
			expect((para.children[0] as Text).content).toBe('Lorem ipsum');
		});

		test('parses ATX headings', () => {
			const lexer = new Lexer('# Heading 1\n## Heading 2\n### Heading 3');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(3);
			expect(doc.children[0]).toBeInstanceOf(Heading);
			expect((doc.children[0] as Heading).level).toBe(1);
			expect(doc.children[1]).toBeInstanceOf(Heading);
			expect((doc.children[1] as Heading).level).toBe(2);
			expect(doc.children[2]).toBeInstanceOf(Heading);
			expect((doc.children[2] as Heading).level).toBe(3);
		});

		test('parses setext headings', () => {
			const lexer = new Lexer('Heading 1\n=========\n\nHeading 2\n---------');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(2);
			expect(doc.children[0]).toBeInstanceOf(Heading);
			expect((doc.children[0] as Heading).level).toBe(1);
			expect((doc.children[0] as Heading).children[0]).toBeInstanceOf(Text);
			expect(((doc.children[0] as Heading).children[0] as Text).content).toBe(
				'Heading 1',
			);
			expect(doc.children[1]).toBeInstanceOf(Heading);
			expect((doc.children[1] as Heading).level).toBe(2);
		});

		test('parses thematic breaks', () => {
			const lexer = new Lexer('---\n***\n___');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(3);
			expect(doc.children[0]).toBeInstanceOf(ThematicBreak);
			expect(doc.children[1]).toBeInstanceOf(ThematicBreak);
			expect(doc.children[2]).toBeInstanceOf(ThematicBreak);
		});

		test('parses indented code blocks', () => {
			const lexer = new Lexer('    const x = 1;\n    const y = 2;');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			expect(doc.children[0]).toBeInstanceOf(CodeBlock);
			const code = doc.children[0] as CodeBlock;
			expect(code.content).toContain('const x = 1;');
			expect(code.content).toContain('const y = 2;');
		});

		test('parses fenced code blocks', () => {
			const lexer = new Lexer('```javascript\nconst x = 1;\n```');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			expect(doc.children[0]).toBeInstanceOf(CodeBlock);
			const code = doc.children[0] as CodeBlock;
			expect(code.language).toBe('javascript');
			expect(code.content).toBe('const x = 1;');
		});

		test('parses emphasis', () => {
			const lexer = new Lexer('This is *emphasized* text');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			const para = doc.children[0] as Paragraph;
			expect(para.children).toHaveLength(3);
			expect(para.children[0]).toBeInstanceOf(Text);
			expect(para.children[1]).toBeInstanceOf(Emphasis);
			expect(para.children[2]).toBeInstanceOf(Text);
		});

		test('parses strong emphasis', () => {
			const lexer = new Lexer('This is **strong** text');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			const para = doc.children[0] as Paragraph;
			expect(para.children).toHaveLength(3);
			expect(para.children[0]).toBeInstanceOf(Text);
			expect(para.children[1]).toBeInstanceOf(Strong);
			expect(para.children[2]).toBeInstanceOf(Text);
		});

		test('parses code spans', () => {
			const lexer = new Lexer('Use `const` for constants');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			const para = doc.children[0] as Paragraph;
			expect(para.children).toHaveLength(3);
			expect(para.children[1]).toBeInstanceOf(CodeSpan);
			expect((para.children[1] as CodeSpan).content).toBe('const');
		});

		test('parses links', () => {
			const lexer = new Lexer('[OpenAI](https://openai.com)');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			const para = doc.children[0] as Paragraph;
			expect(para.children[0]).toBeInstanceOf(Link);
			const link = para.children[0] as Link;
			expect(link.url).toBe('https://openai.com');
			expect((link.label[0] as Text).content).toBe('OpenAI');
		});

		test('parses nested inline elements', () => {
			const lexer = new Lexer('**Bold with *emphasis* inside**');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(1);
			const para = doc.children[0] as Paragraph;
			expect(para.children[0]).toBeInstanceOf(Strong);
			const strong = para.children[0] as Strong;
			expect(strong.children).toHaveLength(3);
			expect(strong.children[1]).toBeInstanceOf(Emphasis);
		});

		test('parses multiple paragraphs', () => {
			const lexer = new Lexer('First paragraph\n\nSecond paragraph');
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(2);
			expect(doc.children[0]).toBeInstanceOf(Paragraph);
			expect(doc.children[1]).toBeInstanceOf(Paragraph);
		});

		test('parses mixed content', () => {
			const lexer = new Lexer(
				'# Heading\n\nThis is a paragraph with **bold** text.\n\n---\n\nAnother paragraph.',
			);
			const parser = new Parser(lexer);
			const doc = parser.parseDocument();

			expect(doc.children).toHaveLength(4);
			expect(doc.children[0]).toBeInstanceOf(Heading);
			expect(doc.children[1]).toBeInstanceOf(Paragraph);
			expect(doc.children[2]).toBeInstanceOf(ThematicBreak);
			expect(doc.children[3]).toBeInstanceOf(Paragraph);
		});
	});
});
