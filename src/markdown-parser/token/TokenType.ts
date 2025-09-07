const EOF = 'EOF';
const EOL = 'EOL';
const WS = 'WS';
const Illegal = 'Illegal';
const Int = 'Int';
const Str = 'Str';
const Hash = 'Hash';
const Asterisk = 'Asterisk';
const Gt = 'Gt';
const Dot = 'Dot';
const Dash = 'Dash';
const Underscore = 'Underscore';
const Tilde = 'Tilde';
const Backtick = 'Backtick';
const LBracket = 'LBracket';
const RBracket = 'RBracket';
const LParen = 'LParen';
const RParen = 'RParen';
const Exclamation = 'Exclamation';

const tokenType = {
	EOF,
	EOL,
	WS,
	Illegal,

	Int,
	Str,

	Hash,
	Asterisk,
	Gt,
	Dot,
	Dash,
	Underscore,
	Tilde,
	Backtick,
	LBracket,
	RBracket,
	LParen,
	RParen,
	Exclamation,
};

type TokenType = ValueOf<typeof tokenType>;

export { type TokenType, tokenType };
