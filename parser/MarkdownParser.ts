import { Block, Document, ThematicBreak } from "../ast/index.ts";
import { tokenType } from "../token/index.ts";
import { Parser } from "./Parser.ts";

export class MarkdownParser extends Parser {
  public parseDocument(): Document {
    const elements: Block[] = [];

    while (this.getLookaheadType(1) !== tokenType.EOF) {
      const element = this.parseBlock();

      if (element !== null) {
        elements.push(element);
      }
    }

    const document = new Document(elements);

    return document;
  }

  private parseBlock(): Block | null {
    const thematicBreak = this.thematicBreak();

    return thematicBreak;
  }

  private thematicBreak(): ThematicBreak | null {
    let indent = 0;

    while (this.getLookaheadType(1) === tokenType.SPACE) {
      this.consume();

      indent += 1;
    }

    if (indent > 3) {
      throw new Error(`To much indent for ThematicBreak, max 3 got ${indent}`);
    }

    const firstToken = this.getLookaheadToken(1);
    const allowedPrefixTypes = [
      tokenType.ASTERISK,
      tokenType.DASH,
      tokenType.UNDERSCORE,
    ];

    if (!allowedPrefixTypes.includes(firstToken.type)) {
      throw new Error(
        `Wrong start token for ThematicBreak, got ${firstToken.literal}`,
      );
    }

    const allowedTypes = [
      firstToken.type,
      tokenType.SPACE,
      tokenType.TAB,
    ];
    let repeatCount = 1;

    while (allowedTypes.includes(this.getLookaheadType(1))) {
      this.consume();

      repeatCount += 1;
    }

    if (repeatCount < 3) {
      throw new Error(
        `Needed 3 or more prefix characters for ThematicBreak, got ${repeatCount}`,
      );
    }

    while (this.getLookaheadType(1) === tokenType.SPACE) {
      this.consume();
    }

    if (this.getLookaheadType(1) === tokenType.EOL) {
      this.consume();
    }

    return new ThematicBreak(firstToken.literal.repeat(repeatCount));
  }
}
