export const OPEN_TAG = 0;
export const CLOSE_TAG = 1;
export const SLASH = 2;
export const IDENTIFIER = 3;
export const EQUALS = 4;
export const ATTRIBUTE_VALUE = 5;
export const TEXT = 6;
export const EXPRESSION = 7;

export type TokenType = typeof OPEN_TAG | typeof CLOSE_TAG | typeof SLASH | typeof IDENTIFIER | typeof EQUALS | typeof ATTRIBUTE_VALUE | typeof TEXT | typeof EXPRESSION;

export interface Token {
  type: TokenType;
  value?: string | unknown;
  index?: number;
  start: number;
  end: number;
  attrContext?: boolean;
}

export function tokenize(strings: TemplateStringsArray, ...values: unknown[]): Token[] {
  const tokens: Token[] = [];
  let globalOffset = 0;
  let inQuotes = false;
  let quoteChar: string | null = null;
  let tagDepth = 0; // Track nesting depth

  strings.forEach((str, i) => {
    let cursor = 0;

    while (cursor < str.length) {
      const char = str[cursor];
      const start = globalOffset + cursor;

      // 1. Check if this is a real tag opening: < followed by identifier or /
      if (char === '<' && !inQuotes) {
        const nextChar = str[cursor + 1];
        const isOpenTag = nextChar && /[a-zA-Z0-9.:_-]/.test(nextChar); // <div, <Component, <my-component, <ns:tag
        const isCloseTag = nextChar === '/'; // </div
        
        if (isOpenTag || isCloseTag) {
          // Always increase tagDepth when entering a tag (whether opening or closing)
          tagDepth++;
          tokens.push({ 
            type: OPEN_TAG, 
            value: char, 
            start, 
            end: start + 1 
          });
          cursor++;
          continue;
        }
      }

      // 2. Check if this is a real tag closing: > (only valid inside a tag)
      if (char === '>' && !inQuotes && tagDepth > 0) {
        tagDepth--;
        tokens.push({ 
          type: CLOSE_TAG, 
          value: char, 
          start, 
          end: start + 1 
        });
        cursor++;
        continue;
      }

      // 3. Inside tag: handle quotes, identifiers, operators
      if (tagDepth > 0 && !inQuotes) {
        // Skip whitespace
        if (/\s/.test(char)) {
          cursor++;
          continue;
        }

        // Opening quote
        if (char === '"' || char === "'") {
          inQuotes = true;
          quoteChar = char;
          cursor++;
          continue;
        }

        // Slash and equals operators
        if (char === '/' || char === '=') {
          const typeMap: { [key: string]: TokenType } = { 
            '/': SLASH, 
            '=': EQUALS 
          };
          tokens.push({ 
            type: typeMap[char], 
            value: char, 
            start, 
            end: start + 1 
          });
          cursor++;
          continue;
        }

        // Identifiers and attribute names
        if (/[a-zA-Z0-9.:_-]/.test(char)) {
          let value = '';
          while (cursor < str.length && /[a-zA-Z0-9.:_-]/.test(str[cursor])) {
            value += str[cursor];
            cursor++;
          }
          tokens.push({ 
            type: IDENTIFIER, 
            value, 
            start, 
            end: start + value.length 
          });
          continue;
        }
      }

      // 4. Inside quotes: capture ATTRIBUTE_VALUE
      if (inQuotes) {
        let value = '';
        while (cursor < str.length && str[cursor] !== quoteChar) {
          value += str[cursor];
          cursor++;
        }
        tokens.push({ 
          type: ATTRIBUTE_VALUE, 
          value, 
          start, 
          end: globalOffset + cursor 
        });

        // Move past closing quote
        if (cursor < str.length && str[cursor] === quoteChar) {
          inQuotes = false;
          quoteChar = null;
          cursor++;
        }
        continue;
      }

      // 5. Outside tags: accumulate text until we hit < or end of meaningful content
      if (tagDepth === 0 && !inQuotes) {
        // Skip pure whitespace
        if (/\s/.test(char)) {
          cursor++;
          continue;
        }

        let textValue = '';
        while (cursor < str.length && str[cursor] !== '<' && (str[cursor] !== '$' || str[cursor + 1] !== '{')) {
          textValue += str[cursor];
          cursor++;
        }
        const trimmedText = textValue.trim();
        if (trimmedText) {
          tokens.push({ 
            type: TEXT, 
            value: trimmedText, 
            start, 
            end: start + textValue.length 
          });
        }
        continue;
      }

      // 6. Fallback: skip unknown character
      cursor++;
    }

    globalOffset += str.length;

    // 7. Expressions between strings
    if (i < values.length) {
      tokens.push({
        type: EXPRESSION,
        value: values[i],
        index: i,
        start: globalOffset,
        end: globalOffset,
        attrContext: inQuotes 
      });
    }
  });

  return tokens;
}