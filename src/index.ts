import { tokenize } from './tokenize';
import { JSXParser, RootNode } from './parse';

/**
 * Parse JSX from a template literal
 * @param strings - Template literal string parts
 * @param values - Template literal interpolated values
 * @returns Parsed AST
 * 
 * @example
 * ```typescript
 * const ast = jsx`<div id="app">${content}</div>`;
 * ```
 */
export function jsx(strings: TemplateStringsArray, ...values: unknown[]): RootNode {
  const tokens = tokenize(strings, ...values);
  const parser = new JSXParser(tokens);
  return parser.parse();
}

// Export types and utilities
export { tokenize } from './tokenize';
export { JSXParser } from './parse';
export type { 
  Token, 
  TokenType 
} from './tokenize';
export type {
  ASTNode,
  RootNode,
  ElementNode,
  TextNode,
  ExpressionNode,
  PropNode,
  BooleanProp,
  StaticProp,
  ExpressionProp,
  MixedProp
} from './parse';
