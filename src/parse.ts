import { Token, TokenType, OPEN_TAG, CLOSE_TAG, SLASH, IDENTIFIER, EQUALS, ATTRIBUTE_VALUE, TEXT, EXPRESSION } from './tokenize';

export interface ASTNode {
  type: string;
  start: number;
  end: number;
}

export interface RootNode extends ASTNode {
  type: 'Root';
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface ElementNode extends ASTNode {
  type: 'Element';
  name: string;
  props: PropNode[];
  children: (ElementNode | TextNode | ExpressionNode)[];
}

export interface TextNode extends ASTNode {
  type: 'Text';
  value: string;
}

export interface ExpressionNode extends ASTNode {
  type: 'Expression';
  index: number;
}

export interface BooleanProp {
  name: string;
  type: 'Boolean';
  value: boolean;
}

export interface StaticProp {
  name: string;
  type: 'Static';
  value: string;
}

export interface ExpressionProp {
  name: string;
  type: 'Expression';
  index: number;
}

export interface SpreadProp {
  type: 'Spread';
  index: number;
}

export interface MixedProp {
  name: string;
  type: 'Mixed';
  value: Array<{ type: string; value?: string; index?: number }>;
}

export type PropNode = BooleanProp | StaticProp | ExpressionProp | SpreadProp | MixedProp;

export class JSXParser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private eat(type?: TokenType): Token {
    const token = this.peek();
    if (token && (!type || token.type === type)) {
      this.pos++;
      return token;
    }
    throw new Error(
      `Unexpected token: ${token?.type}, expected: ${type} at ${token?.start}`
    );
  }

  parse(): RootNode {
    const root: RootNode = {
      type: 'Root',
      children: [],
      start: this.tokens[0]?.start || 0,
      end: this.tokens[this.tokens.length - 1]?.end || 0
    };

    while (this.pos < this.tokens.length) {
      const node = this.parseNode();
      if (node) root.children.push(node);
    }

    return root;
  }

  private parseNode(): ElementNode | TextNode | ExpressionNode | null {
    const token = this.peek();
    if (!token) return null;

    if (token.type === OPEN_TAG) {
      if (this.tokens[this.pos + 1]?.type === SLASH) {
        return null;
      }
      return this.parseElement();
    }

    if (token.type === TEXT) {
      const t = this.eat(TEXT);
      return { 
        type: 'Text', 
        value: t.value as string, 
        start: t.start, 
        end: t.end 
      };
    }

    if (token.type === EXPRESSION && !token.attrContext) {
      const e = this.eat(EXPRESSION);
      return { 
        type: 'Expression', 
        index: e.index as number, 
        start: e.start, 
        end: e.end 
      };
    }

    this.pos++;
    return null;
  }

  private parseElement(): ElementNode {
    const startToken = this.eat(OPEN_TAG);
    const nameToken = this.eat(IDENTIFIER);
    const props = this.parseProps();

    let children: (ElementNode | TextNode | ExpressionNode)[] = [];
    let end = 0;

    if (this.peek()?.type === SLASH) {
      this.eat(SLASH);
      const close = this.eat(CLOSE_TAG);
      end = close.end;
    } else {
      this.eat(CLOSE_TAG);
      
      while (this.pos < this.tokens.length) {
        if (this.peek()?.type === OPEN_TAG && 
            this.tokens[this.pos + 1]?.type === SLASH) {
          break;
        }
        const child = this.parseNode();
        if (child) children.push(child);
      }

      this.eat(OPEN_TAG);
      this.eat(SLASH);
      this.eat(IDENTIFIER);
      const close = this.eat(CLOSE_TAG);
      end = close.end;
    }

    return {
      type: 'Element',
      name: nameToken.value as string,
      props,
      children,
      start: startToken.start,
      end
    };
  }

  private parseProps(): PropNode[] {
    const props: PropNode[] = [];
    
    while (this.pos < this.tokens.length && 
           this.peek()?.type !== CLOSE_TAG && 
           this.peek()?.type !== SLASH) {
      
      // Check for spread property: <div ${...} />
      if (this.peek()?.type === EXPRESSION) {
        const exp = this.eat(EXPRESSION);
        props.push({ type: 'Spread', index: exp.index as number });
        continue;
      }
      
      const name = (this.eat(IDENTIFIER).value as string);
      
      if (this.peek()?.type !== EQUALS) {
        props.push({ name, type: 'Boolean', value: true });
        continue;
      }

      this.eat(EQUALS);
      
      // Collect all parts of the attribute value (may be expression, static text, or both)
      const parts: Array<{ type: string; value?: string; index?: number }> = [];
      let hasAttributeValue = false;
      
      while (this.pos < this.tokens.length && 
            (this.peek()?.type === ATTRIBUTE_VALUE || 
             this.peek()?.type === EXPRESSION)) {
        
        // If we've seen an ATTRIBUTE_VALUE and next is EXPRESSION outside attr context, stop
        if (hasAttributeValue && 
            this.peek()?.type === EXPRESSION && 
            (this.peek() as any).attrContext === false) {
          break;
        }
        
        const part = this.eat();
        if (part.type === EXPRESSION) {
          parts.push({ type: 'Expression', index: part.index });
        } else {
          parts.push({ type: 'Static', value: part.value as string });
          hasAttributeValue = true;
        }
      }

      // Filter out empty static parts (artifacts from closing quotes in templates)
      const meaningfulParts = parts.filter(p => p.type === 'Expression' || (p.type === 'Static' && p.value !== ''));

      // Determine prop type based on what we collected
      if (meaningfulParts.length === 0) {
        // No meaningful value (all empty)
        props.push({ name, type: 'Static', value: '' });
      } else if (meaningfulParts.length === 1 && meaningfulParts[0].type === 'Static') {
        // Single static value
        props.push({ 
          name, 
          type: 'Static', 
          value: meaningfulParts[0].value as string 
        });
      } else if (meaningfulParts.length === 1 && meaningfulParts[0].type === 'Expression') {
        // Single expression value
        props.push({ 
          name, 
          type: 'Expression', 
          index: meaningfulParts[0].index as number 
        });
      } else {
        // Mixed: multiple parts with expressions and/or static text
        props.push({ name, type: 'Mixed', value: meaningfulParts });
      }
    }
    
    return props;
  }
}