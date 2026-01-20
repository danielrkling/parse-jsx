import { describe, it, expect } from 'vitest';
import { jsx } from '../src/index';
import { RootNode, ElementNode, TextNode, ExpressionNode } from '../src/parse';

describe('jsx template literal parser', () => {
  describe('basic parsing', () => {
    it('should parse simple element', () => {
      const ast = jsx`<div></div>`;
      
      expect(ast.type).toBe('Root');
      expect(ast.children).toHaveLength(1);
      
      const element = ast.children[0] as ElementNode;
      expect(element.type).toBe('Element');
      expect(element.name).toBe('div');
    });

    it('should parse element with text content', () => {
      const ast = jsx`<div>Hello</div>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.children).toHaveLength(1);
      
      const text = element.children[0] as TextNode;
      expect(text.type).toBe('Text');
      expect(text.value).toBe('Hello');
    });

    it('should parse element with expression', () => {
      const name = 'World';
      const ast = jsx`<div>Hello ${name}</div>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.children).toHaveLength(2);
      
      const text = element.children[0] as TextNode;
      expect(text.type).toBe('Text');
      expect(text.value).toBe('Hello');
      
      const expr = element.children[1] as ExpressionNode;
      expect(expr.type).toBe('Expression');
      expect(expr.index).toBe(0);
    });

    it('should parse self-closing element', () => {
      const ast = jsx`<input />`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('input');
      expect(element.children).toHaveLength(0);
    });

    it('should parse nested elements', () => {
      const ast = jsx`
        <div>
          <span>text</span>
        </div>
      `;
      
      const div = ast.children[0] as ElementNode;
      expect(div.name).toBe('div');
      
      const span = div.children.find(child => 
        (child as ElementNode).type === 'Element'
      ) as ElementNode;
      expect(span?.name).toBe('span');
    });
  });

  describe('attributes', () => {
    it('should parse string attribute', () => {
      const ast = jsx`<div id="app"></div>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(1);
      
      const prop = element.props[0];
      expect(prop.type).toBe('Static');
      expect((prop as any).name).toBe('id');
      expect((prop as any).value).toBe('app');
    });

    it('should parse boolean attribute', () => {
      const ast = jsx`<input checked />`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      
      expect(prop.type).toBe('Boolean');
      expect((prop as any).name).toBe('checked');
      expect((prop as any).value).toBe(true);
    });

    it('should parse expression attribute', () => {
      const id = 'my-id';
      const ast = jsx`<div id=${id}></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      
      expect(prop.type).toBe('Expression');
      expect((prop as any).name).toBe('id');
      expect((prop as any).index).toBe(0);
    });

    it('should parse quoted expression attribute', () => {
      const id = 'my-id';
      const ast = jsx`<div id="${id}"></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      
      expect(prop.type).toBe('Expression');
      expect((prop as any).name).toBe('id');
      expect((prop as any).index).toBe(0);
    });

    it('should parse mixed attribute (string + expression)', () => {
      const active = true;
      const ast = jsx`<div class="btn ${active ? 'active' : ''}"></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      
      expect(prop.type).toBe('Mixed');
      expect((prop as any).name).toBe('class');
      expect((prop as any).value).toHaveLength(2);
    });

    it('should parse multiple attributes', () => {
      const value = 'test';
      const ast = jsx`<input type="text" value=${value} disabled />`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(3);
      
      expect((element.props[0] as any).name).toBe('type');
      expect((element.props[1] as any).name).toBe('value');
      expect((element.props[2] as any).name).toBe('disabled');
    });
  });

  describe('complex examples', () => {
    it('should parse JSX with multiple expressions', () => {
      const title = 'App';
      const content = 'Hello';
      const count = 42;
      
      const ast = jsx`
        <div id="root">
          <h1>${title}</h1>
          <p>${content} - ${count}</p>
        </div>
      `;
      
      expect(ast.type).toBe('Root');
      expect(ast.children).toHaveLength(1);
      
      const root = ast.children[0] as ElementNode;
      expect(root.name).toBe('div');
    });

    it('should parse list-like structure', () => {
      const items = ['a', 'b', 'c'];
      const ast = jsx`
        <ul>
          <li>${items[0]}</li>
          <li>${items[1]}</li>
          <li>${items[2]}</li>
        </ul>
      `;
      
      const ul = ast.children[0] as ElementNode;
      const listItems = ul.children.filter(child => 
        (child as ElementNode).type === 'Element'
      ) as ElementNode[];
      
      expect(listItems).toHaveLength(3);
      expect(listItems[0].name).toBe('li');
    });

    it('should parse attributes with dynamic values', () => {
      const isActive = true;
      const buttonText = 'Click me';
      const onClick = () => {};
      
      const ast = jsx`
        <button 
          class="btn ${isActive ? 'active' : ''}"
          data-action=${onClick}
          disabled=${!isActive}
        >
          ${buttonText}
        </button>
      `;
      
      const button = ast.children[0] as ElementNode;
      expect(button.name).toBe('button');
      expect(button.props.length).toBeGreaterThan(0);
    });

    it('should preserve position information', () => {
      const ast = jsx`<div>test</div>`;
      
      expect(ast.start).toBeDefined();
      expect(ast.end).toBeDefined();
      
      const element = ast.children[0] as ElementNode;
      expect(element.start).toBeDefined();
      expect(element.end).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty attributes', () => {
      const ast = jsx`<div class=""></div>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(1);
    });

    it('should handle elements with only whitespace', () => {
      const ast = jsx`<div>   </div>`;
      
      const element = ast.children[0] as ElementNode;
      // Whitespace is trimmed during tokenization
      expect(element).toBeDefined();
    });

    it('should handle multiple text nodes and expressions', () => {
      const a = 'A';
      const b = 'B';
      const ast = jsx`<div>Start ${a} Middle ${b} End</div>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.children.length).toBeGreaterThan(1);
    });

    it('should handle single quotes in attributes', () => {
      const ast = jsx`<div title='hello'></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('title');
    });

    it('should handle hyphens in attribute names', () => {
      const value = 'test';
      const ast = jsx`<div data-value=${value}></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('data-value');
    });
  });

  describe('spread props', () => {
    it('should parse spread property', () => {
      const attrs = { id: 'app' };
      const ast = jsx`<div ${attrs} />`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(1);
      
      const prop = element.props[0];
      expect(prop.type).toBe('Spread');
      expect((prop as any).index).toBe(0);
    });

    it('should parse spread with other props', () => {
      const attrs = { id: 'app' };
      const ast = jsx`<div class="container" ${attrs} disabled />`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(3);
      
      expect((element.props[0] as any).name).toBe('class');
      expect(element.props[1].type).toBe('Spread');
      expect((element.props[2] as any).name).toBe('disabled');
    });

    it('should parse multiple spreads', () => {
      const attrs1 = { id: 'app' };
      const attrs2 = { role: 'main' };
      const ast = jsx`<div ${attrs1} ${attrs2} />`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.props).toHaveLength(2);
      
      expect(element.props[0].type).toBe('Spread');
      expect(element.props[1].type).toBe('Spread');
    });
  });

  describe('special characters in names', () => {
    it('should parse tag with hyphens', () => {
      const ast = jsx`<my-component></my-component>`;
      
      expect(ast.type).toBe('Root');
      expect(ast.children).toHaveLength(1);
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('my-component');
    });

    it('should parse tag with periods', () => {
      const ast = jsx`<my.component></my.component>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('my.component');
    });

    it('should parse tag with colons (namespaced)', () => {
      const ast = jsx`<svg:rect></svg:rect>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('svg:rect');
    });

    it('should parse tag with underscores', () => {
      const ast = jsx`<my_component></my_component>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('my_component');
    });

    it('should parse attribute with hyphens', () => {
      const ast = jsx`<div data-id="test"></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('data-id');
      expect((prop as any).value).toBe('test');
    });

    it('should parse attribute with periods', () => {
      const ast = jsx`<div xml.namespace="value"></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('xml.namespace');
      expect((prop as any).value).toBe('value');
    });

    it('should parse attribute with colons', () => {
      const ast = jsx`<svg svg:width="100"></svg>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('svg:width');
      expect((prop as any).value).toBe('100');
    });

    it('should parse attribute with underscores', () => {
      const ast = jsx`<div data_value="test"></div>`;
      
      const element = ast.children[0] as ElementNode;
      const prop = element.props[0];
      expect((prop as any).name).toBe('data_value');
      expect((prop as any).value).toBe('test');
    });

    it('should parse complex names with multiple special characters', () => {
      const ast = jsx`<my-custom.component:v2_test my-attr.name:id="value"></my-custom.component:v2_test>`;
      
      const element = ast.children[0] as ElementNode;
      expect(element.name).toBe('my-custom.component:v2_test');
      
      const prop = element.props[0];
      expect((prop as any).name).toBe('my-attr.name:id');
      expect((prop as any).value).toBe('value');
    });
  });
});
