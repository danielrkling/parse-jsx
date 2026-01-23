import { Token, TokenType, OPEN_TAG_TOKEN, CLOSE_TAG_TOKEN, SLASH_TOKEN, IDENTIFIER_TOKEN, EQUALS_TOKEN, ATTRIBUTE_VALUE_TOKEN, TEXT_TOKEN, EXPRESSION_TOKEN, ATTRIBUTE_EXPRESSION_TOKEN, OpenTagToken, CloseTagToken, IdentifierToken, TextToken, ExpressionToken, AttributeValueToken, SlashToken, EqualsToken, AttributeExpressionToken } from './tokenize';

// Node type constants
export const ROOT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const EXPRESSION_NODE = 3;

// Prop type constants
export const BOOLEAN_PROP = 0;
export const STATIC_PROP = 1;
export const EXPRESSION_PROP = 2;
export const SPREAD_PROP = 3;
export const MIXED_PROP = 4;

export type NodeType = typeof ROOT_NODE | typeof ELEMENT_NODE | typeof TEXT_NODE | typeof EXPRESSION_NODE;
export type PropType = typeof BOOLEAN_PROP | typeof STATIC_PROP | typeof EXPRESSION_PROP | typeof SPREAD_PROP | typeof MIXED_PROP;


export interface RootNode {
  type: typeof ROOT_NODE;
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string;
  props: PropNode[];
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface TextNode {
  type: typeof TEXT_NODE;
  value: string;
}

export interface ExpressionNode {
  type: typeof EXPRESSION_NODE;
  value: number;
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
  quoteChar?: string;
}

export interface ExpressionProp {
  name: string;
  type: typeof EXPRESSION_PROP;
  value: number;
}

export interface SpreadProp {
  type: typeof SPREAD_PROP;
  value: number;
}

export interface MixedProp {
  name: string;
  type: typeof MIXED_PROP;
  value: Array<string|number>;
  quoteChar?: string;
}

export type PropNode = BooleanProp | StaticProp | ExpressionProp | SpreadProp | MixedProp;

class Parser {
  tokens: Token[];
  pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peekToken(): Token | undefined {
    return this.tokens[this.pos];
  }

  eatToken<T extends TokenType>(type: T): Extract<Token, { type: T }> {
    const token = this.peekToken();
    if (token && (!type || token.type === type)) {
      this.pos++;
      return token as Extract<Token, { type: T }>;
    }
    throw new Error(
      `Unexpected token: ${token?.type}, expected: ${type}`
    );
  }

  parseNode(): ElementNode | TextNode | ExpressionNode | null {
    const token = this.peekToken();
    if (!token) return null;

    if (token.type === OPEN_TAG_TOKEN) {
      if (this.tokens[this.pos + 1]?.type === SLASH_TOKEN) {
        return null;
      }
      return this.parseElement();
    }

    if (token.type === TEXT_TOKEN) {
      const t = this.eatToken(TEXT_TOKEN);
      return { 
        type: TEXT_NODE, 
        value: t.value
      };
    }

    if (token.type === EXPRESSION_TOKEN) {
      const e = this.eatToken(EXPRESSION_TOKEN);
      return { 
        type: EXPRESSION_NODE, 
        value: e.value
      };
    }

    this.pos++;
    return null;
  }

  parseElement(): ElementNode {
    const startToken = this.eatToken(OPEN_TAG_TOKEN);
    const nameToken = this.eatToken(IDENTIFIER_TOKEN);
    const props = this.parseProps();

    let children: (ElementNode | TextNode | ExpressionNode)[] = [];

    if (this.peekToken()?.type === SLASH_TOKEN) {
      this.eatToken(SLASH_TOKEN);
      this.eatToken(CLOSE_TAG_TOKEN);
    } else {
      this.eatToken(CLOSE_TAG_TOKEN);
      
      while (this.pos < this.tokens.length) {
        if (this.peekToken()?.type === OPEN_TAG_TOKEN && 
            this.tokens[this.pos + 1]?.type === SLASH_TOKEN) {
          break;
        }
        const child = this.parseNode();
        if (child) children.push(child);
      }

      this.eatToken(OPEN_TAG_TOKEN);
      this.eatToken(SLASH_TOKEN);
      this.eatToken(IDENTIFIER_TOKEN);
      this.eatToken(CLOSE_TAG_TOKEN);
    }

    return {
      type: ELEMENT_NODE,
      name: nameToken.value,
      props,
      children,
    };
  }

  parseProps(): PropNode[] {
    const props: PropNode[] = [];
    
    while (this.pos < this.tokens.length && 
           this.peekToken()?.type !== CLOSE_TAG_TOKEN && 
           this.peekToken()?.type !== SLASH_TOKEN) {
      
      // Check for spread property: <div ${...} />
      if (this.peekToken()?.type === EXPRESSION_TOKEN) {
        const exp = this.eatToken(EXPRESSION_TOKEN);
        props.push({ type: SPREAD_PROP, value: exp.value });
        continue;
      }
      
      const name = this.eatToken(IDENTIFIER_TOKEN).value;
      
      if (this.peekToken()?.type !== EQUALS_TOKEN) {
        props.push({ name, type: BOOLEAN_PROP, value: true });
        continue;
      }

      this.eatToken(EQUALS_TOKEN);
      
      // Collect all parts of the attribute value (may be expression, static text, or both)
      const parts: Array<string|number> = [];
      let hasAttributeValue = false;
      let quoteChar: string | undefined;
      
      while (this.pos < this.tokens.length && 
            (this.peekToken()?.type === ATTRIBUTE_VALUE_TOKEN || 
             this.peekToken()?.type === ATTRIBUTE_EXPRESSION_TOKEN ||
             this.peekToken()?.type === EXPRESSION_TOKEN)) {
        
        // Stop if we've seen a value and now see an EXPRESSION outside quotes (unquoted attr boundary)
        if (hasAttributeValue && 
            this.peekToken()?.type === EXPRESSION_TOKEN) {
          break;
        }
        
        const part = this.peekToken();
        if (part && (part.type === ATTRIBUTE_EXPRESSION_TOKEN || part.type === EXPRESSION_TOKEN)) {
          const exp = part.type === ATTRIBUTE_EXPRESSION_TOKEN 
            ? this.eatToken(ATTRIBUTE_EXPRESSION_TOKEN)
            : this.eatToken(EXPRESSION_TOKEN);
          parts.push(exp.value);
        } else if (part && part.type === ATTRIBUTE_VALUE_TOKEN) {
          const attr = this.eatToken(ATTRIBUTE_VALUE_TOKEN);
          quoteChar = attr.quoteChar;
          parts.push(attr.value);
          hasAttributeValue = true;
      } else {
          this.pos++;
        }
      }


      // Filter out empty static parts (artifacts from closing quotes in templates)
      const meaningfulParts = parts.filter(p => p !== '');

      // Determine prop type based on what we collected
      if (meaningfulParts.length === 0) {
        // No meaningful value (all empty)
        props.push({ name, type: STATIC_PROP, value: '' });
      } else if (meaningfulParts.length === 1 && typeof meaningfulParts[0] === 'string') {
        // Single static value
        props.push({ 
          name, 
          type: STATIC_PROP, 
          value: meaningfulParts[0],
          quoteChar
        });
      } else if (meaningfulParts.length === 1 && typeof meaningfulParts[0] === 'number') {
        // Single expression value
        props.push({ 
          name, 
          type: EXPRESSION_PROP, 
          value: meaningfulParts[0]
        });
      } else {
        // Mixed: multiple parts with expressions and/or static text
        props.push({ name, type: MIXED_PROP, value: meaningfulParts, quoteChar });
      }
    }
    
    return props;
  }
}

export function parse(tokens: Token[]): RootNode {
  const parser = new Parser(tokens);

  const root: RootNode = {
    type: ROOT_NODE,
    children: []
  };

  while (parser.pos < parser.tokens.length) {
    const node = parser.parseNode();
    if (node) root.children.push(node);
  }

  return root;
}