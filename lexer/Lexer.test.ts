import { assertEquals } from "@std/assert";

import { tokenType } from "../token/index.ts";
import { Lexer } from "./index.ts";

Deno.test("Lexer", async (t) => {
  await t.step("Next Token", () => {
    const input = "lorem ipsum\n- - - -    \n";
    const lexer = new Lexer(input);

    const expectedTokens = [
      [tokenType.TEXT, "lorem"],
      [tokenType.SPACE, " "],
      [tokenType.TEXT, "ipsum"],
      [tokenType.EOL, "EOL"],
      [tokenType.DASH, "-"],
      [tokenType.SPACE, " "],
      [tokenType.DASH, "-"],
      [tokenType.SPACE, " "],
      [tokenType.DASH, "-"],
      [tokenType.SPACE, " "],
      [tokenType.DASH, "-"],
      [tokenType.SPACE, " "],
      [tokenType.SPACE, " "],
      [tokenType.SPACE, " "],
      [tokenType.SPACE, " "],
      [tokenType.EOL, "EOL"],
      [tokenType.EOF, "EOF"],
    ] as const;

    for (const [tokenType, literal] of expectedTokens) {
      const token = lexer.nextToken();

      assertEquals(token.type, tokenType);
      assertEquals(token.literal, literal);
    }
  });
});
