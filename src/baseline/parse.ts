import { Token, TokenType, OPEN_TAG, CLOSE_TAG, SLASH, IDENTIFIER, EQUALS, ATTRIBUTE_VALUE, TEXT, EXPRESSION } from './tokenize';

// Node type constants
export const ROOT = 0;
export const ELEMENT = 1;
export const TEXT_NODE = 2;
export const EXPRESSION_NODE = 3;

// Prop type constants
export const BOOLEAN_PROP = 0;
export const STATIC_PROP = 1;
export const EXPRESSION_PROP = 2;
export const SPREAD_PROP = 3;
export const MIXED_PROP = 4;

export type NodeType = typeof ROOT | typeof ELEMENT | typeof TEXT_NODE | typeof EXPRESSION_NODE;
export type PropType = typeof BOOLEAN_PROP | typeof STATIC_PROP | typeof EXPRESSION_PROP | typeof SPREAD_PROP | typeof MIXED_PROP;

export interface ASTNode {
  type: NodeType;
  start: number;
  end: number;
}

export interface RootNode extends ASTNode {
  type: typeof ROOT;
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface ElementNode extends ASTNode {
  type: typeof ELEMENT;
  name: string;
  props: PropNode[];
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface TextNode extends ASTNode {
  type: typeof TEXT_NODE;
  value: string;
}

export interface ExpressionNode extends ASTNode {
  type: typeof EXPRESSION_NODE;
  index: number;
}

export interface BooleanProp {
  name: string;
  type: typeof BOOLEAN_PROP;
  value: boolean;
}

export interface StaticProp {
  name: string;
  type: typeof STATIC_PROP;
  value: string;
}

export interface ExpressionProp {
  name: string;
  type: typeof EXPRESSION_PROP;
  index: number;
}

export interface SpreadProp {
  type: typeof SPREAD_PROP;
  index: number;
}

export interface MixedProp {
  name: string;
  type: typeof MIXED_PROP;
  value: Array<{ type: PropType; value?: string; index?: number }>;
}

export type PropNode = BooleanProp | StaticProp | ExpressionProp | SpreadProp | MixedProp;

function peek(tokens: Token[], pos: number): Token | undefined {
  return tokens[pos];
}

function eat(tokens: Token[], pos: number, type?: TokenType): [Token, number] {
  const token = peek(tokens, pos);
  if (token && (!type || token.type === type)) {
    return [token, pos + 1];
  }
  throw new Error(
    `Unexpected token: ${token?.type}, expected: ${type} at ${token?.start}`
  );
}

export function parse(tokens: Token[]): RootNode {
  let pos = 0;

  function peekToken(): Token | undefined {
    return tokens[pos];
  }

  function eatToken(type?: TokenType): Token {
    const token = peekToken();
    if (token && (!type || token.type === type)) {
      pos++;
      return token;
    }
    throw new Error(
      `Unexpected token: ${token?.type}, expected: ${type} at ${token?.start}`
    );
  }

  function parseNode(): ElementNode | TextNode | ExpressionNode | null {
    const token = peekToken();
    if (!token) return null;

    if (token.type === OPEN_TAG) {
      if (tokens[pos + 1]?.type === SLASH) {
        return null;
      }
      return parseElement();
    }

    if (token.type === TEXT) {
      const t = eatToken(TEXT);
      return { 
        type: TEXT_NODE, 
        value: t.value as string, 
        start: t.start, 
        end: t.end 
      };
    }

    if (token.type === EXPRESSION && !token.attrContext) {
      const e = eatToken(EXPRESSION);
      return { 
        type: EXPRESSION_NODE, 
        index: e.index as number, 
        start: e.start, 
        end: e.end 
      };
    }

    pos++;
    return null;
  }

  function parseElement(): ElementNode {
    const startToken = eatToken(OPEN_TAG);
    const nameToken = eatToken(IDENTIFIER);
    const props = parseProps();

    let children: (ElementNode | TextNode | ExpressionNode)[] = [];
    let end = 0;

    if (peekToken()?.type === SLASH) {
      eatToken(SLASH);
      const close = eatToken(CLOSE_TAG);
      end = close.end;
    } else {
      eatToken(CLOSE_TAG);
      
      while (pos < tokens.length) {
        if (peekToken()?.type === OPEN_TAG && 
            tokens[pos + 1]?.type === SLASH) {
          break;
        }
        const child = parseNode();
        if (child) children.push(child);
      }

      eatToken(OPEN_TAG);
      eatToken(SLASH);
      eatToken(IDENTIFIER);
      const close = eatToken(CLOSE_TAG);
      end = close.end;
    }

    return {
      type: ELEMENT,
      name: nameToken.value as string,
      props,
      children,
      start: startToken.start,
      end
    };
  }

  function parseProps(): PropNode[] {
    const props: PropNode[] = [];
    
    while (pos < tokens.length && 
           peekToken()?.type !== CLOSE_TAG && 
           peekToken()?.type !== SLASH) {
      
      // Check for spread property: <div ${...} />
      if (peekToken()?.type === EXPRESSION) {
        const exp = eatToken(EXPRESSION);
        props.push({ type: SPREAD_PROP, index: exp.index as number });
        continue;
      }
      
      const name = (eatToken(IDENTIFIER).value as string);
      
      if (peekToken()?.type !== EQUALS) {
        props.push({ name, type: BOOLEAN_PROP, value: true });
        continue;
      }

      eatToken(EQUALS);
      
      // Collect all parts of the attribute value (may be expression, static text, or both)
      const parts: Array<{ type: PropType; value?: string; index?: number }> = [];
      let hasAttributeValue = false;
      
      while (pos < tokens.length && 
            (peekToken()?.type === ATTRIBUTE_VALUE || 
             peekToken()?.type === EXPRESSION)) {
        
        // If we've seen an ATTRIBUTE_VALUE and next is EXPRESSION outside attr context, stop
        if (hasAttributeValue && 
            peekToken()?.type === EXPRESSION && 
            (peekToken() as any).attrContext === false) {
          break;
        }
        
        const part = eatToken();
        if (part.type === EXPRESSION) {
          parts.push({ type: EXPRESSION_PROP, index: part.index });
        } else {
          parts.push({ type: STATIC_PROP, value: part.value as string });
          hasAttributeValue = true;
        }
      }

      // Filter out empty static parts (artifacts from closing quotes in templates)
      const meaningfulParts = parts.filter(p => p.type === EXPRESSION_PROP || (p.type === STATIC_PROP && p.value !== ''));

      // Determine prop type based on what we collected
      if (meaningfulParts.length === 0) {
        // No meaningful value (all empty)
        props.push({ name, type: STATIC_PROP, value: '' });
      } else if (meaningfulParts.length === 1 && meaningfulParts[0].type === STATIC_PROP) {
        // Single static value
        props.push({ 
          name, 
          type: STATIC_PROP, 
          value: meaningfulParts[0].value as string 
        });
      } else if (meaningfulParts.length === 1 && meaningfulParts[0].type === EXPRESSION_PROP) {
        // Single expression value
        props.push({ 
          name, 
          type: EXPRESSION_PROP, 
          index: meaningfulParts[0].index as number 
        });
      } else {
        // Mixed: multiple parts with expressions and/or static text
        props.push({ name, type: MIXED_PROP, value: meaningfulParts });
      }
    }
    
    return props;
  }

  const root: RootNode = {
    type: ROOT,
    children: [],
    start: tokens[0]?.start || 0,
    end: tokens[tokens.length - 1]?.end || 0
  };

  while (pos < tokens.length) {
    const node = parseNode();
    if (node) root.children.push(node);
  }

  return root;
}