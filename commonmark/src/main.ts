import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { type ASTNode } from "./types";

export class CommonMarkParser {
  private lexer: Lexer;
  private parser: Parser;

  constructor() {
    this.lexer = new Lexer("");
    this.parser = new Parser([]);
  }

  public parse(markdown: string): ASTNode {
    // Tokenize the input
    this.lexer.reset(markdown);
    const tokens = this.lexer.tokenize();

    // Parse tokens into AST
    this.parser = new Parser(tokens);
    return this.parser.parse();
  }

  public static parseMarkdown(markdown: string): ASTNode {
    const parser = new CommonMarkParser();
    return parser.parse(markdown);
  }
}

// Utility function to convert AST to HTML (basic implementation)
export function astToHTML(node: ASTNode): string {
  switch (node.type) {
    case "DOCUMENT":
      return node.children?.map(astToHTML).join("") || "";

    case "HEADING":
      const headingContent = node.children?.map(astToHTML).join("") || "";
      return `<h${node.level}>${headingContent}</h${node.level}>`;

    case "PARAGRAPH":
      const paragraphContent = node.children?.map(astToHTML).join("") || "";
      return `<p>${paragraphContent}</p>`;

    case "TEXT":
      return node.content || "";

    case "EMPHASIS":
      const emphasisContent = node.children?.map(astToHTML).join("") || "";
      return `<em>${emphasisContent}</em>`;

    case "STRONG":
      const strongContent = node.children?.map(astToHTML).join("") || "";
      return `<strong>${strongContent}</strong>`;

    case "CODE":
      return `<code>${node.content || ""}</code>`;

    case "CODE_BLOCK":
      const langClass = node.language
        ? ` class="language-${node.language}"`
        : "";
      return `<pre><code${langClass}>${node.content || ""}</code></pre>`;

    case "LINK":
      const linkContent = node.children?.map(astToHTML).join("") || "";
      return `<a href="${node.url || ""}">${linkContent}</a>`;

    case "IMAGE":
      return `<img src="${node.url || ""}" alt="${node.alt || ""}" />`;

    case "BLOCKQUOTE":
      const blockquoteContent = node.children?.map(astToHTML).join("") || "";
      return `<blockquote>${blockquoteContent}</blockquote>`;

    default:
      return "";
  }
}

// Usage example
if (typeof window !== "undefined") {
  // Browser environment example
  (window as any).CommonMarkParser = CommonMarkParser;
  (window as any).astToHTML = astToHTML;
}

// Example usage
const exampleMarkdown = `# Hello World

## This is a subheading
 ## This is a subheading with leading space

This is a **bold** text and this is *italic*.

Here's some \`inline code\` and a [link](https://example.com).

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

> This is a blockquote
> with multiple lines.

![Image](https://example.com/image.jpg)
`;

// Parse the example
const ast = CommonMarkParser.parseMarkdown(exampleMarkdown);
//console.log("AST:", JSON.stringify(ast, null, 2));

const html = astToHTML(ast);
//console.log("HTML:", html);
document.body.innerHTML = html;

export { Lexer } from "./lexer";
export { Parser } from "./parser";
export * from "./types";
