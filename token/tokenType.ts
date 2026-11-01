const ILLEGAL = "ILLEGAL";
const EOF = "EOF";
const EOL = "EOL";
const WS = "WS";
const TAB = "TAB";

const HASH = "HASH";
const ASTERISK = "ASTERISK";
const UNDERSCORE = "UNDERSCORE";
const BACKTICK = "BACKTICK";
const LBRACKET = "LBRACKET";
const RBRACKET = "RBRACKET";
const LPAREN = "LPAREN";
const RPAREN = "RPAREN";
const EXCLAMATION = "EXCLAMATION";
const GT = "GT";
const LT = "LT";
const DASH = "DASH";
const PLUS = "PLUS";
const DOT = "DOT";
const TILDE = "TILDE";
const BACKSLASH = "BACKSLASH";
const EQUALS = "EQUALS";

const TEXT = "TEXT";

export const tokenType = {
  EOF,
  EOL,
  WS,
  TAB,
  HASH,
  ASTERISK,
  UNDERSCORE,
  BACKTICK,
  LBRACKET,
  RBRACKET,
  LPAREN,
  RPAREN,
  EXCLAMATION,
  GT,
  LT,
  DASH,
  PLUS,
  DOT,
  TILDE,
  BACKSLASH,
  EQUALS,
  ILLEGAL,
  TEXT,
};

export type TokenType = (typeof tokenType)[keyof typeof tokenType];
