import { type Token, TokenType, type ASTNode, ASTNodeType } from "./types";

export class Parser {
  private tokens: Token[] = [];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(offset: number = 0): Token | null {
    const pos = this.position + offset;
    return pos < this.tokens.length ? this.tokens[pos] : null;
  }

  private advance(): Token | null {
    if (this.position >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.position++];
  }

  private skipWhitespace(): void {
    while (this.peek()?.type === TokenType.WHITESPACE) {
      this.advance();
    }
  }

  private isAtStartOfLine(): boolean {
    // Check if we're at the beginning of input or after a newline
    if (this.position === 0) return true;

    let pos = this.position - 1;
    // Skip backwards over whitespace
    while (pos >= 0 && this.tokens[pos].type === TokenType.WHITESPACE) {
      pos--;
    }

    return pos < 0 || this.tokens[pos].type === TokenType.NEWLINE;
  }

  private parseHeading(): ASTNode | null {
    if (!this.isAtStartOfLine() || this.peek()?.type !== TokenType.HASH) {
      return null;
    }

    let level = 0;
    // Count consecutive hashes
    while (this.peek()?.type === TokenType.HASH && level < 6) {
      this.advance();
      level++;
    }

    // Must have space or end of line after hashes
    const next = this.peek();
    if (
      next &&
      next.type !== TokenType.WHITESPACE &&
      next.type !== TokenType.NEWLINE &&
      next.type !== TokenType.EOF
    ) {
      return null;
    }

    this.skipWhitespace();

    // Parse the heading text
    const children: ASTNode[] = [];
    while (
      this.peek() &&
      this.peek()!.type !== TokenType.NEWLINE &&
      this.peek()!.type !== TokenType.EOF
    ) {
      const inlineNode = this.parseInline();
      if (inlineNode) {
        children.push(inlineNode);
      }
    }

    return {
      type: ASTNodeType.HEADING,
      level,
      children,
    };
  }

  private parseBlockquote(): ASTNode | null {
    if (
      !this.isAtStartOfLine() ||
      this.peek()?.type !== TokenType.GREATER_THAN
    ) {
      return null;
    }

    this.advance(); // consume '>'
    this.skipWhitespace();

    const children: ASTNode[] = [];

    // Parse content until end of line
    while (
      this.peek() &&
      this.peek()!.type !== TokenType.NEWLINE &&
      this.peek()!.type !== TokenType.EOF
    ) {
      const node = this.parseBlock();
      if (node) {
        children.push(node);
      } else {
        const inlineNode = this.parseInline();
        if (inlineNode) {
          children.push(inlineNode);
        }
      }
    }

    // If no content, create an empty paragraph
    if (children.length === 0) {
      children.push({
        type: ASTNodeType.PARAGRAPH,
        children: [],
      });
    }

    return {
      type: ASTNodeType.BLOCKQUOTE,
      children,
    };
  }

  private parseCodeBlock(): ASTNode | null {
    if (!this.isAtStartOfLine() || this.peek()?.type !== TokenType.BACKTICK) {
      return null;
    }

    let backtickCount = 0;
    const startPos = this.position;

    // Count opening backticks
    while (this.peek()?.type === TokenType.BACKTICK) {
      this.advance();
      backtickCount++;
    }

    if (backtickCount < 3) {
      // Reset position, this isn't a code block
      this.position = startPos;
      return null;
    }

    // Parse info string (language)
    let language = "";
    this.skipWhitespace();
    while (this.peek() && this.peek()!.type === TokenType.TEXT) {
      language += this.advance()!.value;
    }

    // Skip to next line
    if (this.peek()?.type === TokenType.NEWLINE) {
      this.advance();
    }

    // Collect code content
    let content = "";
    while (this.peek() && this.peek()!.type !== TokenType.EOF) {
      // Check for closing backticks
      if (this.peek()?.type === TokenType.BACKTICK) {
        let closingCount = 0;
        //const beforeClosing = this.position;

        while (this.peek()?.type === TokenType.BACKTICK) {
          this.advance();
          closingCount++;
        }

        if (closingCount >= backtickCount && this.isAtStartOfLine()) {
          // Found closing fence
          break;
        } else {
          // Not a closing fence, add the backticks to content
          // this.position = beforeClosing;
          content += this.advance()!.value;
        }
      } else {
        content += this.advance()!.value;
      }
    }

    return {
      type: ASTNodeType.CODE_BLOCK,
      content,
      language: language || undefined,
    };
  }

  private parseEmphasis(): ASTNode | null {
    const token = this.peek();
    if (
      !token ||
      (token.type !== TokenType.ASTERISK && token.type !== TokenType.UNDERSCORE)
    ) {
      return null;
    }

    const marker = token.type;
    const markerChar = token.value;

    // Check for strong emphasis (**)
    if (this.peek(1)?.type === marker) {
      this.advance(); // first marker
      this.advance(); // second marker

      const children: ASTNode[] = [];

      // Parse until closing markers
      while (this.peek()) {
        if (this.peek()?.type === marker && this.peek(1)?.type === marker) {
          this.advance(); // consume first closing marker
          this.advance(); // consume second closing marker
          break;
        }

        const node = this.parseInline();
        if (node) {
          children.push(node);
        }
      }

      return {
        type: ASTNodeType.STRONG,
        children,
      };
    } else {
      // Single emphasis
      this.advance(); // consume marker

      const children: ASTNode[] = [];

      // Parse until closing marker
      while (this.peek()) {
        if (this.peek()?.type === marker) {
          this.advance(); // consume closing marker
          break;
        }

        const node = this.parseInline();
        if (node) {
          children.push(node);
        }
      }

      return {
        type: ASTNodeType.EMPHASIS,
        children,
      };
    }
  }

  private parseInlineCode(): ASTNode | null {
    if (this.peek()?.type !== TokenType.BACKTICK) {
      return null;
    }

    let backtickCount = 0;
    // Count opening backticks
    while (this.peek()?.type === TokenType.BACKTICK) {
      this.advance();
      backtickCount++;
    }

    let content = "";
    while (this.peek() && this.peek()!.type !== TokenType.EOF) {
      if (this.peek()?.type === TokenType.BACKTICK) {
        let closingCount = 0;
        const beforeClosing = this.position;

        while (this.peek()?.type === TokenType.BACKTICK) {
          this.advance();
          closingCount++;
        }

        if (closingCount === backtickCount) {
          // Found matching closing backticks
          break;
        } else {
          // Not matching, add to content
          this.position = beforeClosing;
          content += this.advance()!.value;
        }
      } else {
        content += this.advance()!.value;
      }
    }

    return {
      type: ASTNodeType.CODE,
      content,
    };
  }

  private parseLink(): ASTNode | null {
    const isImage = this.peek()?.type === TokenType.EXCLAMATION;

    if (isImage) {
      this.advance(); // consume '!'
    }

    if (this.peek()?.type !== TokenType.LEFT_BRACKET) {
      return null;
    }

    this.advance(); // consume '['

    // Parse link text
    const textChildren: ASTNode[] = [];
    while (this.peek() && this.peek()!.type !== TokenType.RIGHT_BRACKET) {
      const node = this.parseInline();
      if (node) {
        textChildren.push(node);
      }
    }

    if (this.peek()?.type !== TokenType.RIGHT_BRACKET) {
      return null; // No closing bracket
    }
    this.advance(); // consume ']'

    if (this.peek()?.type !== TokenType.LEFT_PAREN) {
      return null; // No opening parenthesis
    }
    this.advance(); // consume '('

    // Parse URL
    let url = "";
    while (
      this.peek() &&
      this.peek()!.type !== TokenType.RIGHT_PAREN &&
      this.peek()!.type !== TokenType.WHITESPACE
    ) {
      url += this.advance()!.value;
    }

    // Optional title (not implemented in this basic version)

    if (this.peek()?.type !== TokenType.RIGHT_PAREN) {
      return null; // No closing parenthesis
    }
    this.advance(); // consume ')'

    return {
      type: isImage ? ASTNodeType.IMAGE : ASTNodeType.LINK,
      url,
      children: textChildren,
      alt: isImage
        ? textChildren.map((n) => n.content || "").join("")
        : undefined,
    };
  }

  private parseInline(): ASTNode | null {
    const token = this.peek();
    if (!token) return null;

    // Try parsing different inline elements
    let node = this.parseInlineCode();
    if (node) return node;

    node = this.parseLink();
    if (node) return node;

    node = this.parseEmphasis();
    if (node) return node;

    // Default to text
    if (token.type === TokenType.TEXT) {
      this.advance();
      return {
        type: ASTNodeType.TEXT,
        content: token.value,
      };
    }

    // Handle other tokens as text
    if (token.type !== TokenType.NEWLINE && token.type !== TokenType.EOF) {
      this.advance();
      return {
        type: ASTNodeType.TEXT,
        content: token.value,
      };
    }

    return null;
  }

  private parseParagraph(): ASTNode | null {
    const children: ASTNode[] = [];

    while (
      this.peek() &&
      this.peek()!.type !== TokenType.NEWLINE &&
      this.peek()!.type !== TokenType.EOF
    ) {
      const node = this.parseInline();
      if (node) {
        children.push(node);
      }
    }

    if (children.length === 0) {
      return null;
    }

    return {
      type: ASTNodeType.PARAGRAPH,
      children,
    };
  }

  private parseBlock(): ASTNode | null {
    this.skipWhitespace();

    const token = this.peek();
    if (!token || token.type === TokenType.EOF) {
      return null;
    }

    // Try different block types
    let node = this.parseHeading();
    if (node) return node;

    node = this.parseCodeBlock();
    if (node) return node;

    node = this.parseBlockquote();
    if (node) return node;

    // Default to paragraph
    return this.parseParagraph();
  }

  public parse(): ASTNode {
    const children: ASTNode[] = [];

    while (this.peek() && this.peek()!.type !== TokenType.EOF) {
      // Skip empty lines
      if (this.peek()?.type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }

      const node = this.parseBlock();
      if (node) {
        children.push(node);
      }

      // Skip trailing newlines
      while (this.peek()?.type === TokenType.NEWLINE) {
        this.advance();
      }
    }

    return {
      type: ASTNodeType.DOCUMENT,
      children,
    };
  }
}
