export abstract class Node {
	/**
	 * The literal value of the token associated with this node.
	 * For example, for a heading node, this could be the '#' character.
	 * For a text node, this could be the actual text content.
	 * This is used for debugging and testing purposes to verify that the correct tokens are being parsed into the correct nodes.
	 */
	public abstract get tokenLiteral(): string;

	/**
	 * Returns a string representation of the node and its children.
	 * This is used for debugging and testing purposes to visualize the structure of the AST.
	 * For example, a heading node with level 2 and text "Hello" might return "[h 2]Hello[/h]".
	 */
	public abstract toString(): string;
}
