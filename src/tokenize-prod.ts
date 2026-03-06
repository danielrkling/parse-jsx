export const OPEN_TAG_TOKEN = 0;
export const CLOSE_TAG_TOKEN = 1;
export const SLASH_TOKEN = 2;
export const IDENTIFIER_TOKEN = 3;
export const EQUALS_TOKEN = 4;
export const QUOTED_STRING_TOKEN = 5;
export const TEXT_TOKEN = 6;
export const EXPRESSION_TOKEN = 7;
export const SPREAD_TOKEN = 9;

const isIdentifierChar = (code: number): boolean => {
  return (
    isIdentifierStart(code) ||
    (code >= 48 && code <= 58) ||
    code === 46 ||
    code === 45
  );
};

const isIdentifierStart = (code: number): boolean => {
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    code === 95 ||
    code === 36
  );
};

const isWhitespace = (code: number): boolean => {
  return (code >= 9 && code <= 13) || code === 32;
};

export interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
}

export interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
}

export interface SlashToken {
  type: typeof SLASH_TOKEN;
}

export interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}

export interface EqualsToken {
  type: typeof EQUALS_TOKEN;
}

export interface QuotedStringToken {
  type: typeof QUOTED_STRING_TOKEN;
  value: string;
  quote: "'" | '"';
}

export interface TextToken {
  type: typeof TEXT_TOKEN;
  value: string;
}

export interface ExpressionToken {
  type: typeof EXPRESSION_TOKEN;
  value: number;
}

export interface SpreadToken {
  type: typeof SPREAD_TOKEN;
}

export type Token =
  | OpenTagToken
  | CloseTagToken
  | SlashToken
  | IdentifierToken
  | EqualsToken
  | QuotedStringToken
  | TextToken
  | ExpressionToken
  | SpreadToken;

const STATE_TEXT = 0;
const STATE_TAG = 1;
const STATE_COMMENT = 4;

export const tokenize = (
  strings: TemplateStringsArray | string[],
  expressionLengths?: number[],
): Token[] => {
  const tokens: Token[] = [];
  let state = STATE_TEXT;
  let globalPosition = 0;

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    const len = str.length;
    let cursor = 0;

    while (cursor < len) {
      switch (state) {
        case STATE_TEXT: {
          const nextTag = str.indexOf("<", cursor);
          if (nextTag === -1) {
            if (cursor < len) {
              tokens.push({
                type: TEXT_TOKEN,
                value: str.slice(cursor),
              });
            }
            cursor = len;
          } else {
            if (nextTag > cursor) {
              tokens.push({
                type: TEXT_TOKEN,
                value: str.slice(cursor, nextTag),
              });
            }

            if (
              str[nextTag + 1] === "!" &&
              str[nextTag + 2] === "-" &&
              str[nextTag + 3] === "-"
            ) {
              state = STATE_COMMENT;
              cursor = nextTag + 4;
            } else {
              tokens.push({
                type: OPEN_TAG_TOKEN,
              });
              state = STATE_TAG;
              cursor = nextTag + 1;
            }
          }
          break;
        }
        case STATE_TAG: {
          const code = str.charCodeAt(cursor);

          if (isWhitespace(code)) {
            cursor++;
          } else if (code === 62) {
            state = STATE_TEXT;
            tokens.push({
              type: CLOSE_TAG_TOKEN,
            });
            cursor++;
          } else if (code === 61) {
            tokens.push({
              type: EQUALS_TOKEN,
            });
            cursor++;
          } else if (code === 47) {
            tokens.push({
              type: SLASH_TOKEN,
            });
            cursor++;
          } else if (code === 34 || code === 39) {
            const char = str[cursor] as "'" | '"';
            const endQuoteIndex = str.indexOf(char, cursor + 1);

            if (endQuoteIndex === -1) {
              throw new Error(
                `Unterminated string at ${globalPosition + cursor}`,
              );
            }
            tokens.push({
              type: QUOTED_STRING_TOKEN,
              value: str.slice(cursor + 1, endQuoteIndex),
              quote: char,
            });
            cursor = endQuoteIndex + 1;
          } else if (isIdentifierStart(code)) {
            const start = cursor;
            while (cursor < len && isIdentifierChar(str.charCodeAt(cursor)))
              cursor++;
            const value = str.slice(start, cursor);
            tokens.push({
              type: IDENTIFIER_TOKEN,
              value,
            });
          } else if (
            code === 46 &&
            str[cursor + 1] === "." &&
            str[cursor + 2] === "."
          ) {
            tokens.push({
              type: SPREAD_TOKEN,
            });
            cursor += 3;
          } else {
            const pos = globalPosition + cursor;
            const ctxStart = Math.max(0, cursor - 5);
            const ctxEnd = Math.min(len, cursor + 5);
            const snippet = str.slice(ctxStart, ctxEnd);
            throw new Error(`Unexpected '${str[cursor]}' at ${pos}: ${snippet}`);
          }
          break;
        }
        case STATE_COMMENT: {
          const endComment = str.indexOf("-->", cursor);

          if (endComment === -1) {
            cursor = len;
          } else {
            state = STATE_TEXT;
            cursor = endComment + 3;
          }
          break;
        }
      }
    }

    if (i < strings.length - 1) {
      if (state !== STATE_COMMENT) {
        tokens.push({
          type: EXPRESSION_TOKEN,
          value: i,
        });
      }
    }

    globalPosition += str.length;
  }

  return tokens;
};
