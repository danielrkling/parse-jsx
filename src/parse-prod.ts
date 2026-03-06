import {
  QUOTED_STRING_TOKEN,
  CLOSE_TAG_TOKEN,
  EQUALS_TOKEN,
  EXPRESSION_TOKEN,
  IDENTIFIER_TOKEN,
  OPEN_TAG_TOKEN,
  SLASH_TOKEN,
  SPREAD_TOKEN,
  TEXT_TOKEN,
  Token,
} from "./tokenize-prod";

export const ROOT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const EXPRESSION_NODE = 3;

export const BOOLEAN_PROP = 0;
export const STRING_PROP = 1;
export const EXPRESSION_PROP = 2;
export const SPREAD_PROP = 3;

export type NodeType =
  | typeof ROOT_NODE
  | typeof ELEMENT_NODE
  | typeof TEXT_NODE
  | typeof EXPRESSION_NODE;
export type PropType =
  | typeof BOOLEAN_PROP
  | typeof STRING_PROP
  | typeof EXPRESSION_PROP
  | typeof SPREAD_PROP;

export type ChildNode = ElementNode | TextNode | ExpressionNode;

export interface RootNode {
  type: typeof ROOT_NODE;
  children: ChildNode[];
}

export interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string | number;
  props: PropNode[];
  children: ChildNode[];
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

export interface StringProp {
  name: string;
  type: typeof STRING_PROP;
  value: string;
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

export type PropNode = BooleanProp | StringProp | ExpressionProp | SpreadProp;

export const parse = (
  tokens: Token[],
): RootNode => {
  const root: RootNode = { type: ROOT_NODE, children: [] };
  const stack: (RootNode | ElementNode)[] = [root];
  let pos = 0;
  const len = tokens.length;

  while (pos < len) {
    const token = tokens[pos];
    const parent = stack[stack.length - 1];

    switch (token.type) {
      case TEXT_TOKEN: {
        const value = token.value;
        if (value.trim() === "") {
          const prevType = tokens[pos - 1]?.type;
          const nextType = tokens[pos + 1]?.type;
          if (prevType === CLOSE_TAG_TOKEN || nextType === OPEN_TAG_TOKEN) {
            pos++;
            continue;
          }
        }
        parent.children.push({
          type: TEXT_NODE,
          value,
        });
        pos++;
        continue;
      }

      case EXPRESSION_TOKEN: {
        parent.children.push({
          type: EXPRESSION_NODE,
          value: token.value,
        });
        pos++;
        continue;
      }

      case OPEN_TAG_TOKEN: {
        pos++;
        const nextToken = tokens[pos];

        if (nextToken.type === SLASH_TOKEN) {
          pos++;
          const nameToken = tokens[pos];
          const currentElement = stack[stack.length - 1] as ElementNode;
          if (
            stack.length > 1 &&
            nameToken.type === IDENTIFIER_TOKEN &&
            currentElement.name === nameToken.value
          ) {
            stack.pop();
            pos += 2;
            continue;
          }
          const expectedName = stack.length > 1 ? (stack[stack.length - 1] as ElementNode).name : "none";
          const gotName = nameToken.type === IDENTIFIER_TOKEN ? nameToken.value : `type ${nameToken.type}`;
          throw new Error(`Mismatched tag: expected '${expectedName}', got '${gotName}'`);
        }

        if (nextToken.type === IDENTIFIER_TOKEN) {
          const tagName = nextToken.value;
          const node = {
            type: ELEMENT_NODE,
            name: tagName,
            props: [],
            children: [],
          } as ElementNode;
          parent.children.push(node);
          pos++;

          while (pos < len) {
            const attrToken = tokens[pos];
            if (
              attrToken.type === CLOSE_TAG_TOKEN ||
              attrToken.type === SLASH_TOKEN
            ) {
              break;
            }

            if (attrToken.type === SPREAD_TOKEN) {
              const expr = tokens[pos + 1];
              if (expr?.type === EXPRESSION_TOKEN) {
                node.props.push({
                  type: SPREAD_PROP,
                  value: expr.value,
                });
                pos += 2;
              } else {
                throw new Error("Spread must be followed by expression");
              }
            } else if (attrToken.type === IDENTIFIER_TOKEN) {
              const name = attrToken.value;
              const next = tokens[pos + 1];

              if (next?.type === EQUALS_TOKEN) {
                pos += 2;
                const valToken = tokens[pos];
                if (valToken.type === EXPRESSION_TOKEN) {
                  node.props.push({
                    name,
                    type: EXPRESSION_PROP,
                    value: valToken.value,
                  });
                  pos++;
                } else if (valToken.type === QUOTED_STRING_TOKEN) {
                  node.props.push({
                    name,
                    type: STRING_PROP,
                    value: valToken.value,
                  });
                  pos++;
                }
              } else {
                node.props.push({
                  type: BOOLEAN_PROP,
                  name,
                  value: true,
                });
                pos++;
              }
            } else {
              const tokenInfo = attrToken.type === EXPRESSION_TOKEN 
                ? `expression (index ${attrToken.value})`
                : attrToken.type === QUOTED_STRING_TOKEN 
                  ? `string "${attrToken.value}"`
                  : `token type ${attrToken.type}`;
              throw new Error(`Invalid attribute: unexpected ${tokenInfo}`);
            }
          }

          const endToken = tokens[pos];
          if (endToken.type === SLASH_TOKEN) {
            pos += 2;
          } else if (endToken.type === CLOSE_TAG_TOKEN) {
            pos++;
            stack.push(node);
          }
          continue;
        } else {
          const tokenDesc = nextToken 
            ? `token type ${nextToken.type}`
            : 'end of input';
          throw new Error(`Expected tag name, got: ${tokenDesc}`);
        }
      }

      default:
        throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
    }
  }

  if (stack.length > 1) {
    const unclosedTags = stack.slice(1).map(n => (n as ElementNode).name).join(", ");
    throw new Error(`Unclosed tag: ${unclosedTags}`);
  }

  return root;
};
