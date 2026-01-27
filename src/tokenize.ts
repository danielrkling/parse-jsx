export const OPEN_TAG_TOKEN = 0;
export const CLOSE_TAG_TOKEN = 1;
export const SLASH_TOKEN = 2;
export const IDENTIFIER_TOKEN = 3;
export const EQUALS_TOKEN = 4;
export const ATTRIBUTE_VALUE_TOKEN = 5;
export const TEXT_TOKEN = 6;
export const EXPRESSION_TOKEN = 7;
export const ATTRIBUTE_EXPRESSION_TOKEN = 8;
export const QUOTE_CHAR_TOKEN = 9;

export type TokenType =
  | typeof OPEN_TAG_TOKEN
  | typeof CLOSE_TAG_TOKEN
  | typeof SLASH_TOKEN
  | typeof IDENTIFIER_TOKEN
  | typeof EQUALS_TOKEN
  | typeof ATTRIBUTE_VALUE_TOKEN
  | typeof TEXT_TOKEN
  | typeof EXPRESSION_TOKEN
  | typeof ATTRIBUTE_EXPRESSION_TOKEN
  | typeof QUOTE_CHAR_TOKEN;

// Character code helpers for fast path testing (faster than regex)
const isIdentifierChar = (code: number): boolean => {
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 46 || // .
    code === 58 || // :
    code === 95 || // _
    code === 45
  ); // -
};

const isWhitespace = (code: number): boolean => {
  return (code >= 9 && code <= 13) || code === 32; // \t \n \v \f \r space
};

export interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
  value: "<";
}

export interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
  value: ">";
}

export interface SlashToken {
  type: typeof SLASH_TOKEN;
  value: "/";
}

export interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}

export interface EqualsToken {
  type: typeof EQUALS_TOKEN;
  value: "=";
}

export interface AttributeValueToken {
  type: typeof ATTRIBUTE_VALUE_TOKEN;
  value: string;
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

export interface QuoteCharToken {
  type: typeof QUOTE_CHAR_TOKEN;
  value: "'" | '"';
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
  | AttributeExpressionToken
  | QuoteCharToken;

class Tokenizer {
  tokens: Token[] = [];
  globalOffset = 0;
  inQuotes = false;
  quoteChar?: "'" | '"'
  tagDepth = 0;
  attrContext = false;

  processString(str: string, i: number, strLen: number, values: unknown[]) {
    let cursor = 0;

    while (cursor < str.length) {
      const char = str[cursor];

      // 1. Check if this is a real tag opening: < followed by identifier or /
      if (char === "<" && !this.inQuotes) {
        const nextCode = str.charCodeAt(cursor + 1);
        const isOpenTag = nextCode > 0 && isIdentifierChar(nextCode); // <div, <Component, <my-component, <ns:tag
        const isCloseTag = nextCode === 47; // '/' = 47

        if (isOpenTag || isCloseTag) {
          // Always increase tagDepth when entering a tag (whether opening or closing)
          this.tagDepth++;
          this.tokens.push({
            type: OPEN_TAG_TOKEN,
            value: char,
          });
          cursor++;
          continue;
        }
      }

      // 2. Check if this is a real tag closing: > (only valid inside a tag)
      if (char === ">" && !this.inQuotes && this.tagDepth > 0) {
        this.tagDepth--;
        this.tokens.push({
          type: CLOSE_TAG_TOKEN,
          value: char,
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
            this.tokens.push({
            type: QUOTE_CHAR_TOKEN,
            value: char,
            });
          cursor++;
          continue;
        }

        if (char === "/") {
          this.tokens.push({
            type:SLASH_TOKEN,
            value: char,
          });
          cursor++;
          continue;
        }

        if (char === "=") {
          this.tokens.push({
            type: EQUALS_TOKEN,
            value: char,
          });
          cursor++;
          continue;
        }

        // Identifiers and attribute names
        if (isIdentifierChar(code)) {
          const startIdx = cursor;
          while (
            cursor < str.length &&
            isIdentifierChar(str.charCodeAt(cursor))
          ) {
            cursor++;
          }
          const value = str.slice(startIdx, cursor);
          this.tokens.push({
            type: IDENTIFIER_TOKEN,
            value,
          });
          continue;
        }
      }

      // 4. Inside quotes: capture ATTRIBUTE_VALUE
      if (this.inQuotes) {
        let value = "";
        while (cursor < str.length && str[cursor] !== this.quoteChar) {
          value += str[cursor];
          cursor++;
        }
        if (value.length > 0) {
          this.tokens.push({
            type: ATTRIBUTE_VALUE_TOKEN,
            value,
          });
        }

        // Move past closing quote
        if (cursor < str.length && str[cursor] === this.quoteChar) {
            this.tokens.push({
            type: QUOTE_CHAR_TOKEN,
            value: this.quoteChar!,
          });
          this.inQuotes = false;
          this.quoteChar = undefined;
          cursor++;
        }
        continue;
      }

      // 5. Outside tags: accumulate text until we hit < or end of meaningful content
      if (this.tagDepth === 0 && !this.inQuotes) {
        const indexOfNextTag = str.indexOf("<", cursor);
        if (indexOfNextTag === cursor) {
          // We're at a tag, skip to next iteration
          cursor++;
          continue;
        } else if (indexOfNextTag > cursor) {
          // There's text before the next tag
          const textValue = str.slice(cursor, indexOfNextTag);
          this.tokens.push({
            type: TEXT_TOKEN,
            value: textValue,
          });
          cursor = indexOfNextTag;
          continue;
        } else {
          // No more tags in this string, get all remaining text
          const textValue = str.slice(cursor);
          if (textValue.length > 0) {
            this.tokens.push({
              type: TEXT_TOKEN,
              value: textValue,
            });
          }
          cursor = str.length;
          continue;
        }
      }

      // 6. Fallback: skip unknown character
      cursor++;
    }

    this.globalOffset += str.length;

    // 7. Expressions between strings
    if (i < strLen - 1 && i < values.length) {
      this.tokens.push({
        type:  EXPRESSION_TOKEN,
        value: i,
      });
    }
  }
}

export function tokenize(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Token[] {
  const tokenizer = new Tokenizer();
  strings.forEach((str, i) =>
    tokenizer.processString(str, i, strings.length, values),
  );
  return tokenizer.tokens;
}
