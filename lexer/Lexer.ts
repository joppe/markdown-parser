import { EOF, EOL, isEndOfLine, isLetter, SPACE } from "../char/index.ts";
import { Token, tokenType } from "../token/index.ts";
import { Position } from "./Position.ts";

export class Lexer {
  private readonly _input: string;
  private _line: number;
  private _column: number;

  /**
   * point to the position of the current char
   */
  private _position: number;

  /**
   * point to the next char
   */
  private _readPosition;
  private _char = EOF;

  constructor(input: string) {
    this._input = input;
    this._readPosition = 0;
    this._position = 0;
    this._line = 1;
    this._column = 1;

    this.readChar();
  }

  public getCurrentPosition(): Position {
    return {
      line: this._line,
      column: this._column,
      offset: this._position,
    };
  }

  public nextToken(): Token {
    let token: Token;

    switch (this._char) {
      case EOL:
        token = new Token(tokenType.EOL, "EOL");
        break;
      case EOF:
        token = new Token(tokenType.EOF, "EOF");
        break;
      case SPACE:
        token = new Token(tokenType.SPACE, " ");
        break;
      case "#":
        token = new Token(
          tokenType.HASH,
          "#",
        );
        break;
      case "*":
        token = new Token(
          tokenType.ASTERISK,
          "*",
        );
        break;
      case "_":
        token = new Token(
          tokenType.UNDERSCORE,
          "_",
        );
        break;
      case "`":
        token = new Token(
          tokenType.BACKTICK,
          "`",
        );
        break;
      case "[":
        token = new Token(
          tokenType.LBRACKET,
          "[",
        );
        break;
      case "]":
        token = new Token(
          tokenType.RBRACKET,
          "]",
        );
        break;
      case "(":
        token = new Token(
          tokenType.LPAREN,
          "(",
        );
        break;
      case ")":
        token = new Token(
          tokenType.RPAREN,
          ")",
        );
        break;
      case "!":
        token = new Token(
          tokenType.EXCLAMATION,
          "!",
        );
        break;
      case "<":
        token = new Token(
          tokenType.LT,
          "<",
        );
        break;
      case ">":
        token = new Token(
          tokenType.GT,
          ">",
        );
        break;
      case "-":
        token = new Token(
          tokenType.DASH,
          "-",
        );
        break;
      case "+":
        token = new Token(
          tokenType.PLUS,
          "+",
        );
        break;
      case ".":
        token = new Token(
          tokenType.DOT,
          ".",
        );
        break;
      case "~":
        token = new Token(
          tokenType.TILDE,
          "~",
        );
        break;
      case "\\":
        token = new Token(
          tokenType.BACKSLASH,
          "\\",
        );
        break;
      case "=":
        token = new Token(
          tokenType.EQUALS,
          "=",
        );
        break;
      default: {
        return new Token(
          tokenType.TEXT,
          this.readText(),
        );
      }
    }

    this.readChar();

    return token;
  }

  private peekChar(): string {
    if (this._readPosition >= this._input.length) {
      return EOF;
    }

    return this._input[this._readPosition];
  }

  private readText(): string {
    const position = this._position;

    while (isLetter(this._char)) {
      this.readChar();
    }

    return this._input.slice(position, this._position);
  }

  private readChar(): void {
    if (this._readPosition >= this._input.length) {
      this._char = EOF;
    } else {
      this._char = this._input[this._readPosition];
    }

    this._position = this._readPosition;
    this._readPosition += 1;

    if (isEndOfLine(this._char)) {
      this._line += 1;
      this._column = 1;
    } else {
      this._column += 1;
    }
  }
}
