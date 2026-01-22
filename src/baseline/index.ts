import { tokenize } from './tokenize';
import { parse, RootNode } from './parse';

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
  return parse(tokens);
}

// Export types and utilities
export { tokenize } from './tokenize';
export { parse } from './parse';
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
export {
  ROOT,
  ELEMENT,
  TEXT_NODE,
  EXPRESSION_NODE,
  BOOLEAN_PROP,
  STATIC_PROP,
  EXPRESSION_PROP,
  SPREAD_PROP,
  MIXED_PROP
} from './parse';
