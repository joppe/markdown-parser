import { LeafBlock } from "./LeafBlock.ts";

export class ThematicBreak implements LeafBlock {
  private readonly _tokenLiteral: string;

  public constructor(tokenLiteral: string) {
    this._tokenLiteral = tokenLiteral;
  }

  public tokenLiteral(): string {
    return "";
  }

  public toString(): string {
    return "<hr />";
  }
}
