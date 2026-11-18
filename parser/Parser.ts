import { Lexer } from "../lexer/index.ts";
import { Token, TokenType } from "../token/index.ts";

type Alternative = () => void;

export abstract class Parser {
  protected _lookahead: Token[] = [];
  protected _pointer: number = 0;
  protected readonly _lexer: Lexer;

  private readonly _markers: number[] = [];

  public constructor(lexer: Lexer) {
    this._lexer = lexer;
  }

  protected match(type: TokenType): void {
    if (this.getLookaheadType(1) === type) {
      this.consume();
    } else {
      throw new Error(
        `Expecting "${type}", found "${this.getLookaheadToken(1).type}"`,
      );
    }
  }

  protected consume(): void {
    this._pointer += 1;

    if ((this._pointer === this._lookahead.length) && !this.isSpeculating()) {
      this._pointer = 0;

      this._lookahead = [];
    }

    this.sync(1);
  }

  protected getLookaheadToken(offset: number): Token {
    this.sync(offset);

    return this._lookahead[this._pointer + offset - 1];
  }

  protected getLookaheadType(offset: number): TokenType {
    return this.getLookaheadToken(offset).type;
  }

  protected isSpeculating(): boolean {
    return this._markers.length > 0;
  }

  protected mark(): number {
    this._markers.push(this._pointer);

    return this._pointer;
  }

  protected release(): void {
    const pointer = this._markers.pop();

    if (pointer === undefined) {
      throw new Error("Error popping marker");
    }

    this.seek(pointer);
  }

  protected seek(pointer: number): void {
    this._pointer = pointer;
  }

  /**
   * Make sure we have enough lookahead tokens
   */
  protected sync(offset: number): void {
    const desiredBufferSize = this._pointer + offset;
    const currentBufferSize = this._lookahead.length;

    if (desiredBufferSize > currentBufferSize) {
      this.fill(desiredBufferSize - currentBufferSize);
    }
  }

  /**
   * Add tokens to the lookahead array
   */
  protected fill(count: number): void {
    for (let i = 0; i < count; i += 1) {
      this._lookahead.push(this._lexer.nextToken());
    }
  }

  /**
   * Try if the given alternative function is successful
   */
  protected speculate(alternative: Alternative): boolean {
    let isSuccessFul = true;

    this.mark();

    try {
      alternative();
    } catch (_error) {
      isSuccessFul = false;
    }

    this.release();

    return isSuccessFul;
  }
}
