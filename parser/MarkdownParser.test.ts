import { assertEquals, assertInstanceOf } from "@std/assert";

import { MarkdownParser } from "./index.ts";
import { Lexer } from "../lexer/index.ts";
import { ThematicBreak } from "../ast/index.ts";

Deno.test("MarkdownParser", async (t) => {
  await t.step("Parse Thematic Break", () => {
    const inputs = [
      "***",
      "---",
      "___",
      "  ___",
      "   ***",
      "______",
      "______   ",
      "_ _ _",
    ];

    for (const input of inputs) {
      const lexer = new Lexer(input);
      const parser = new MarkdownParser(lexer);
      const document = parser.parseDocument();

      assertEquals(document.elements.length, 1);

      const element = document.elements[0];

      assertInstanceOf(element, ThematicBreak);
    }
  });
});
