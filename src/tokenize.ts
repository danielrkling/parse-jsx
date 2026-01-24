export const OPEN_TAG_TOKEN = 0;
export const CLOSE_TAG_TOKEN = 1;
export const SLASH_TOKEN = 2;
export const IDENTIFIER_TOKEN = 3;
export const EQUALS_TOKEN = 4;
export const ATTRIBUTE_VALUE_TOKEN = 5;
export const TEXT_TOKEN = 6;
export const EXPRESSION_TOKEN = 7;
export const ATTRIBUTE_EXPRESSION_TOKEN = 8;

export type TokenType = typeof OPEN_TAG_TOKEN | typeof CLOSE_TAG_TOKEN | typeof SLASH_TOKEN | typeof IDENTIFIER_TOKEN | typeof EQUALS_TOKEN | typeof ATTRIBUTE_VALUE_TOKEN | typeof TEXT_TOKEN | typeof EXPRESSION_TOKEN | typeof ATTRIBUTE_EXPRESSION_TOKEN;

// Character code helpers for fast path testing (faster than regex)
const isIdentifierChar = (code: number): boolean => {
  return (code >= 48 && code <= 57) ||  // 0-9
         (code >= 65 && code <= 90) ||  // A-Z
         (code >= 97 && code <= 122) || // a-z
         code === 46 ||   // .
         code === 58 ||   // :
         code === 95 ||   // _
         code === 45;     // -
};

const isWhitespace = (code: number): boolean => {
  return (code >= 9 && code <= 13) || code === 32; // \t \n \v \f \r space
};

export interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
  value: string;
}

export interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
  value: string;
}

export interface SlashToken {
  type: typeof SLASH_TOKEN;
  value: string;
}

export interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}

export interface EqualsToken {
  type: typeof EQUALS_TOKEN;
  value: string;
}

export interface AttributeValueToken {
  type: typeof ATTRIBUTE_VALUE_TOKEN;
  value: string;
  quoteChar?: string;
}

export interface TextToken {
  type: typeof TEXT_TOKEN;
  value: string;
}

export interface ExpressionToken {
  type: typeof EXPRESSION_TOKEN;
  value: number;
}

export interface AttributeExpressionToken {
  type: typeof ATTRIBUTE_EXPRESSION_TOKEN;
  value: number;
}

export type Token = 
  | OpenTagToken
  | CloseTagToken
  | SlashToken
  | IdentifierToken
  | EqualsToken
  | AttributeValueToken
  | TextToken
  | ExpressionToken
  | AttributeExpressionToken;

class Tokenizer {
  tokens: Token[] = [];
  globalOffset = 0;
  inQuotes = false;
  quoteChar: string | null = null;
  tagDepth = 0;
  attrContext = false;

  processString(str: string, i: number, strLen: number, values: unknown[]) {
    let cursor = 0;

    while (cursor < str.length) {
      const char = str[cursor];
      const start = this.globalOffset + cursor;

      // 1. Check if this is a real tag opening: < followed by identifier or /
      if (char === '<' && !this.inQuotes) {
        const nextCode = str.charCodeAt(cursor + 1);
        const isOpenTag = nextCode > 0 && isIdentifierChar(nextCode); // <div, <Component, <my-component, <ns:tag
        const isCloseTag = nextCode === 47; // '/' = 47
        
        if (isOpenTag || isCloseTag) {
          // Always increase tagDepth when entering a tag (whether opening or closing)
          this.tagDepth++;
          this.tokens.push({ 
            type: OPEN_TAG_TOKEN, 
            value: char
          });
          cursor++;
          continue;
        }
      }

      // 2. Check if this is a real tag closing: > (only valid inside a tag)
      if (char === '>' && !this.inQuotes && this.tagDepth > 0) {
        this.tagDepth--;
        this.tokens.push({ 
          type: CLOSE_TAG_TOKEN, 
          value: char
        });
        cursor++;
        continue;
      }

      // 3. Inside tag: handle quotes, identifiers, operators
      if (this.tagDepth > 0 && !this.inQuotes) {
        const code = str.charCodeAt(cursor);
        
        // Skip whitespace
        if (isWhitespace(code)) {
          cursor++;
          continue;
        }

        // Opening quote
        if (char === '"' || char === "'") {
          this.inQuotes = true;
          this.quoteChar = char;
          cursor++;
          continue;
        }

        // Slash and equals operators
        if (code === 47 || code === 61) { // '/' = 47, '=' = 61
          this.tokens.push({ 
            type: code === 47 ? SLASH_TOKEN : EQUALS_TOKEN, 
            value: char
          });
          cursor++;
          continue;
        }

        // Identifiers and attribute names
        if (isIdentifierChar(code)) {
          const startIdx = cursor;
          while (cursor < str.length && isIdentifierChar(str.charCodeAt(cursor))) {
            cursor++;
          }
          const value = str.slice(startIdx, cursor);
          this.tokens.push({ 
            type: IDENTIFIER_TOKEN, 
            value
          });
          continue;
        }
      }

      // 4. Inside quotes: capture ATTRIBUTE_VALUE
      if (this.inQuotes) {
        let value = '';
        while (cursor < str.length && str[cursor] !== this.quoteChar) {
          value += str[cursor];
          cursor++;
        }
        this.tokens.push({ 
          type: ATTRIBUTE_VALUE_TOKEN, 
          value,
          quoteChar: this.quoteChar!
        });

        // Move past closing quote
        if (cursor < str.length && str[cursor] === this.quoteChar) {
          this.inQuotes = false;
          this.quoteChar = null;
          cursor++;
        }
        continue;
      }

      // 5. Outside tags: accumulate text until we hit < or end of meaningful content
      if (this.tagDepth === 0 && !this.inQuotes) {
        // Skip pure whitespace
        // if (isWhitespace(str.charCodeAt(cursor))) {
        //   cursor++;
        //   continue;
        // }
        const indexOfNextTag = str.indexOf('<', cursor);
        if (indexOfNextTag > cursor) {
            const textValue = str.slice(cursor, indexOfNextTag);
            const trimmedText = textValue.trim();
            if (trimmedText) {
              this.tokens.push({
                type: TEXT_TOKEN, 
                value: textValue
              });
            }
            cursor = indexOfNextTag;
            continue;
        }
        cursor++;
        continue;
      }

      // 6. Fallback: skip unknown character
      cursor++;
    }

    this.globalOffset += str.length;

    // 7. Expressions between strings
    if (i < strLen - 1 && i < values.length) {
      this.tokens.push({
        type: this.inQuotes ? ATTRIBUTE_EXPRESSION_TOKEN : EXPRESSION_TOKEN,
        value: i
      });
    }
  }
}

export function tokenize(strings: TemplateStringsArray, ...values: unknown[]): Token[] {
  const tokenizer = new Tokenizer();
  strings.forEach((str, i) => tokenizer.processString(str, i, strings.length, values));
  return tokenizer.tokens;
}