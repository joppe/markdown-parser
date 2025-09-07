// Token types for the lexer
export enum TokenType {
  // Text content
  TEXT = 'TEXT',
  WHITESPACE = 'WHITESPACE',
  NEWLINE = 'NEWLINE',
  
  // Headers
  HASH = 'HASH',
  
  // Emphasis
  ASTERISK = 'ASTERISK',
  UNDERSCORE = 'UNDERSCORE',
  
  // Code
  BACKTICK = 'BACKTICK',
  
  // Links and images
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  EXCLAMATION = 'EXCLAMATION',
  
  // Blockquotes
  GREATER_THAN = 'GREATER_THAN',
  
  // Lists
  DASH = 'DASH',
  PLUS = 'PLUS',
  DOT = 'DOT',
  
  // Horizontal rules
  MINUS = 'MINUS',
  
  // Code blocks
  TILDE = 'TILDE',
  
  // HTML
  LESS_THAN = 'LESS_THAN',
  
  // Escape
  BACKSLASH = 'BACKSLASH',
  
  // Numbers for ordered lists
  NUMBER = 'NUMBER',
  
  // End of file
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  position: {
    line: number;
    column: number;
    offset: number;
  };
}

// AST Node types
export enum ASTNodeType {
  DOCUMENT = 'DOCUMENT',
  PARAGRAPH = 'PARAGRAPH',
  HEADING = 'HEADING',
  TEXT = 'TEXT',
  EMPHASIS = 'EMPHASIS',
  STRONG = 'STRONG',
  CODE = 'CODE',
  CODE_BLOCK = 'CODE_BLOCK',
  LINK = 'LINK',
  IMAGE = 'IMAGE',
  BLOCKQUOTE = 'BLOCKQUOTE',
  LIST = 'LIST',
  LIST_ITEM = 'LIST_ITEM',
  HORIZONTAL_RULE = 'HORIZONTAL_RULE',
  HTML = 'HTML',
  SOFT_BREAK = 'SOFT_BREAK',
  HARD_BREAK = 'HARD_BREAK'
}

export interface ASTNode {
  type: ASTNodeType;
  children?: ASTNode[];
  content?: string;
  level?: number; // For headings
  url?: string; // For links/images
  title?: string; // For links/images
  alt?: string; // For images
  language?: string; // For code blocks
  ordered?: boolean; // For lists
  tight?: boolean; // For lists
}

export interface Position {
  line: number;
  column: number;
  offset: number;
}