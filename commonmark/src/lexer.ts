import { type Token, TokenType, type Position } from "./types";

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private getCurrentPosition(): Position {
    return {
      line: this.line,
      column: this.column,
      offset: this.position,
    };
  }

  private peek(offset: number = 0): string {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : "";
  }

  private advance(): string {
    if (this.position >= this.input.length) {
      return "";
    }

    const char = this.input[this.position];
    this.position++;

    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  private readWhile(predicate: (char: string) => boolean): string {
    let result = "";
    while (this.position < this.input.length && predicate(this.peek())) {
      result += this.advance();
    }
    return result;
  }

  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t";
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
  }

  private readNumber(): string {
    return this.readWhile(this.isDigit);
  }

  private readText(): string {
    let result = "";

    while (this.position < this.input.length) {
      const char = this.peek();

      // Stop at special markdown characters
      if (
        this.isSpecialChar(char) ||
        char === "\n" ||
        this.isWhitespace(char)
      ) {
        break;
      }

      result += this.advance();
    }

    return result;
  }

  private isSpecialChar(char: string): boolean {
    const specialChars = [
      "#",
      "*",
      "_",
      "`",
      "[",
      "]",
      "(",
      ")",
      "!",
      ">",
      "-",
      "+",
      ".",
      "~",
      "<",
      "\\",
    ];
    return specialChars.includes(char);
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const char = this.peek();
      const position = this.getCurrentPosition();

      if (char === "\n") {
        tokens.push({
          type: TokenType.NEWLINE,
          value: this.advance(),
          position,
        });
      } else if (this.isWhitespace(char)) {
        const whitespace = this.readWhile(this.isWhitespace);
        tokens.push({
          type: TokenType.WHITESPACE,
          value: whitespace,
          position,
        });
      } else if (char === "#") {
        tokens.push({
          type: TokenType.HASH,
          value: this.advance(),
          position,
        });
      } else if (char === "*") {
        tokens.push({
          type: TokenType.ASTERISK,
          value: this.advance(),
          position,
        });
      } else if (char === "_") {
        tokens.push({
          type: TokenType.UNDERSCORE,
          value: this.advance(),
          position,
        });
      } else if (char === "`") {
        tokens.push({
          type: TokenType.BACKTICK,
          value: this.advance(),
          position,
        });
      } else if (char === "[") {
        tokens.push({
          type: TokenType.LEFT_BRACKET,
          value: this.advance(),
          position,
        });
      } else if (char === "]") {
        tokens.push({
          type: TokenType.RIGHT_BRACKET,
          value: this.advance(),
          position,
        });
      } else if (char === "(") {
        tokens.push({
          type: TokenType.LEFT_PAREN,
          value: this.advance(),
          position,
        });
      } else if (char === ")") {
        tokens.push({
          type: TokenType.RIGHT_PAREN,
          value: this.advance(),
          position,
        });
      } else if (char === "!") {
        tokens.push({
          type: TokenType.EXCLAMATION,
          value: this.advance(),
          position,
        });
      } else if (char === ">") {
        tokens.push({
          type: TokenType.GREATER_THAN,
          value: this.advance(),
          position,
        });
      } else if (char === "-") {
        tokens.push({
          type: TokenType.MINUS,
          value: this.advance(),
          position,
        });
      } else if (char === "+") {
        tokens.push({
          type: TokenType.PLUS,
          value: this.advance(),
          position,
        });
      } else if (char === ".") {
        tokens.push({
          type: TokenType.DOT,
          value: this.advance(),
          position,
        });
      } else if (char === "~") {
        tokens.push({
          type: TokenType.TILDE,
          value: this.advance(),
          position,
        });
      } else if (char === "<") {
        tokens.push({
          type: TokenType.LESS_THAN,
          value: this.advance(),
          position,
        });
      } else if (char === "\\") {
        tokens.push({
          type: TokenType.BACKSLASH,
          value: this.advance(),
          position,
        });
      } else if (this.isDigit(char)) {
        const number = this.readNumber();
        tokens.push({
          type: TokenType.NUMBER,
          value: number,
          position,
        });
      } else {
        // Read regular text
        const text = this.readText();
        if (text) {
          tokens.push({
            type: TokenType.TEXT,
            value: text,
            position,
          });
        } else {
          // Skip unknown character
          this.advance();
        }
      }
    }

    // Add EOF token
    tokens.push({
      type: TokenType.EOF,
      value: "",
      position: this.getCurrentPosition(),
    });

    return tokens;
  }

  public reset(input?: string): void {
    if (input !== undefined) {
      this.input = input;
    }
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }
}

