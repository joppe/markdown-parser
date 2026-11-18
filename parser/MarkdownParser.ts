import { Block, Document, ThematicBreak } from "../ast/index.ts";
import { Lexer } from "../lexer/index.ts";
import { type Token, tokenType } from "../token/index.ts";

const BUFFER_SIZE = 7;

export class MarkdownParser {
  private readonly _lexer: Lexer;
  private _lookahead: Token[];
  private _pointer: number;

  public constructor(lexer: Lexer, bufferSize = BUFFER_SIZE) {
    this._lexer = lexer;
    this._lookahead = [];
    this._pointer = 0;

    for (let _ = 0; _ < bufferSize; _ += 1) {
      this.nextToken();
    }
  }

  public parseDocument(): Document {
    const elements: Block[] = [];

    while (this.currentToken().type !== tokenType.EOF) {
      const element = this.parseBlock();

      if (element !== null) {
        elements.push(element);
      }

      this.nextToken();
    }

    const document = new Document(elements);

    return document;
  }

  private parseBlock(): Block | null {
    const thematicBreak = this.parseThematicBreak();

    return thematicBreak;
  }

  private parseThematicBreak(): ThematicBreak | null {
    let indent = 0;
    let peek = 0;

    while (this.peekToken(peek).type === tokenType.SPACE) {
      indent += 1;
      peek += 1;
    }

    if (indent > 3) {
      return null;
    }

    const allowedTypes = [
      tokenType.ASTERISK,
      tokenType.DASH,
      tokenType.UNDERSCORE,
    ];

    if (!allowedTypes.includes(this.peekToken(peek).type)) {
      return null;
    }

    const firstToken = this.peekToken(peek);
    peek += 1;

    let repeatCount = 1;

    while (this.peekToken(peek).type === firstToken.type) {
      repeatCount += 1;
      peek += 1;
    }

    if (repeatCount < 3) {
      return null;
    }

    while (this.peekToken(peek).type === tokenType.SPACE) {
      peek += 1;
    }

    if (this.peekToken(peek).type === tokenType.EOL) {
      peek += 1;
    }

    return new ThematicBreak(firstToken.literal.repeat(repeatCount));
  }

  private currentToken(): Token {
    return this.peekToken(0);
  }

  private nextToken(): void {
    this._lookahead[this._pointer] = this._lexer.nextToken();
    this._pointer = (this._pointer + 1) % BUFFER_SIZE;
  }

  private peekToken(offset: number): Token {
    const index = (this._pointer + offset) % BUFFER_SIZE;

    return this._lookahead[index] as Token;
  }
}
