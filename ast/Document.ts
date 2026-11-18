import { type Block } from "./Block.ts";
import { type ContainerBlock } from "./ContainerBlock.ts";

export class Document implements ContainerBlock {
  private _elements: Block[];

  public get elements(): Block[] {
    return this._elements;
  }

  public constructor(elements: Block[]) {
    this._elements = elements;
  }

  public tokenLiteral(): string {
    if (this._elements.length > 0) {
      return this._elements[0].tokenLiteral();
    }

    return "";
  }

  public toString(): string {
    return `${this._elements.map((element) => element.toString()).join("")}`;
  }
}
