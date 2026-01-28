import { tokenize } from './tokenize';
import { parse, RootNode } from './parse';

export const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export const rawTextElements = new Set([
  'script',
  'style',
  'textarea',
  'title',
]);

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
  const tokens = tokenize(strings, rawTextElements);
  return parse(tokens, voidElements);
}

// Export types and utilities
export { tokenize } from './tokenize';
export { parse } from './parse';
export type { 
  Token, 
  TokenType 
} from './tokenize';
export type {
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
  ROOT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  EXPRESSION_NODE,
  BOOLEAN_PROP,
  STATIC_PROP,
  EXPRESSION_PROP,
  SPREAD_PROP,
  MIXED_PROP
} from './parse';
