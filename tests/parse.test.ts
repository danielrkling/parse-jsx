import { describe, it, expect } from "vitest";
import {
  BOOLEAN_PROP,
  ELEMENT_NODE,
  EXPRESSION_NODE,
  MIXED_PROP,
  ROOT_NODE,
  STATIC_PROP,
  TEXT_NODE,
  EXPRESSION_PROP,
  SPREAD_PROP,
  jsx,
} from "../src/index";

describe("Simple AST", () => {
  it("simple element", () => {
    const ast = jsx`<div></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [{ type: ELEMENT_NODE, name: "div", props: [], children: [] }],
    });
  });

  it("text content", () => {
    const ast = jsx`<div>Hello</div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "Hello" }],
        },
      ],
    });
  });

  it("expression inside text", () => {
    const name = "World";
    const ast = jsx`<div>Hello ${name}</div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: TEXT_NODE, value: "Hello " },
            { type: EXPRESSION_NODE, value: 0 },
          ],
        },
      ],
    });
  });

  it("self-closing", () => {
    const ast = jsx`<input />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        { type: ELEMENT_NODE, name: "input", props: [], children: [] },
      ],
    });
  });

  it("nested elements", () => {
    const ast = jsx`
      <div>
        <span>text</span>
      </div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "span",
              props: [],
              children: [{ type: TEXT_NODE, value: "text" }],
            },
          ],
        },
      ],
    });
  });
});

describe("Attributes", () => {
  it("string attribute", () => {
    const ast = jsx`<div id="app"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            { name: "id", type: STATIC_PROP, value: "app", quoteChar: '"' },
          ],
          children: [],
        },
      ],
    });
  });

  it("boolean attribute", () => {
    const ast = jsx`<input checked />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "input",
          props: [{ name: "checked", type: BOOLEAN_PROP, value: true }],
          children: [],
        },
      ],
    });
  });

  it("expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id=${id}></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0 }],
          children: [],
        },
      ],
    });
  });

  it("quoted expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id="${id}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0 }],
          children: [],
        },
      ],
    });
  });

    it("single quoted expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id='${id}'></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0 }],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (string + expression)", () => {
    const active = true;
    const ast = jsx`<div class="btn ${active ? "active" : ""}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quoteChar: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

    it("mixed attribute (string + expression)", () => {
    const active = true;
    const ast = jsx`<div class="btn ${active ? "active" : ""}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quoteChar: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (string + expression) with single quotes", () => {
    const active = true;
    const ast = jsx`<div class='btn ${active ? "active" : ""}'></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quoteChar: "'",
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (2 expression) with whitespace", () => {
    const active = true;
    const ast = jsx`<div class="${active ? "active" : ""}  ${"1"}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: [0, "  ", 1],
              quoteChar: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("multiple attributes", () => {
    const value = "test";
    const ast = jsx`<input type="text" value=${value} disabled />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "input",
          props: [
            { name: "type", type: STATIC_PROP, value: "text", quoteChar: '"' },
            { name: "value", type: EXPRESSION_PROP, value: 0 },
            { name: "disabled", type: BOOLEAN_PROP, value: true },
          ],
          children: [],
        },
      ],
    });
  });
});

describe("whitespace handling", () => {
  it("preserves whitespace in text nodes in root", () => {
    const ast = jsx`  Hello <div>   Hello   World   </div> !   `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        { type: TEXT_NODE, value: "  Hello " },
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "   Hello   World   " }],

        },
        { type: TEXT_NODE, value: " !   " },
      ],
    });
  });

  it("trims leading and trailing whitespace-only text nodes at root", () => {
    const ast = jsx`
    <div>Hello World</div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "Hello World" }],
        },
      ],
    });
  });

  it("preserves whitespace in text nodes", () => {
    const ast = jsx`<div>   Hello   World   </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "   Hello   World   " }],
        },
      ],
    });
  });
  it("preserves whitespace in text nodes with elements", () => {
    const ast = jsx`<div>
       Hello World
       <span>!</span> 
       </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            {
              type: TEXT_NODE,
              value: `
       Hello World
       `,
            },
            {
              type: ELEMENT_NODE,
              name: "span",
              props: [],
              children: [{ type: TEXT_NODE, value: "!" }],
            },
          ],
        },
      ],
    });
  });

  it("preserves whitespace in mixed text nodes", () => {
    const name = "User";
    const ast = jsx`<div>  Hello ${name}  !  </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: TEXT_NODE, value: "  Hello " },
            { type: EXPRESSION_NODE, value: 0 },
            { type: TEXT_NODE, value: "  !  " },
          ],
        },
      ],
    });
  });

  it("trims whitespace-only text nodes around expressions", () => {
    const name = "User";
    const ast = jsx`<div>
      ${name}
    </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: EXPRESSION_NODE, value: 0 }],
        },
      ],
    });
  });

  it("filters only beginning and trailing whitespace in mixed text nodes", () => {
    const name = "User";
    const ast = jsx`<div>  ${"Hello"} ${name}  !  </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: EXPRESSION_NODE, value: 0 },
            { type: TEXT_NODE, value: " " },
            { type: EXPRESSION_NODE, value: 1 },
            { type: TEXT_NODE, value: "  !  " },
          ],
        },
      ],
    });
  });
});

describe("Complex Examples", () => {
  it("JSX with multiple expressions", () => {
    const title = "App";
    const content = "Hello";
    const count = 42;
    const ast = jsx`
      <div id="root">
        <h1>${title}</h1>
        <p>${content} - ${count}</p>
      </div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            { name: "id", type: STATIC_PROP, value: "root", quoteChar: '"' },
          ],
          children: [
            {
              type: ELEMENT_NODE,
              name: "h1",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE,
              name: "p",
              props: [],
              children: [
                { type: EXPRESSION_NODE, value: 1 },
                { type: TEXT_NODE, value: " - " },
                { type: EXPRESSION_NODE, value: 2 },
              ],
            },
          ],
        },
      ],
    });
  });

  it("list-like structure", () => {
    const items = ["a", "b", "c"];
    const ast = jsx`
      <ul>
        <li>${items[0]}</li>
        <li>${items[1]}</li>
        <li>${items[2]}</li>
      </ul>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "ul",
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 1 }],
            },
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 2 }],
            },
          ],
        },
      ],
    });
  });
});
