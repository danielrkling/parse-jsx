import { describe, it, expect } from 'vitest';
import { tokenize, OPEN_TAG, CLOSE_TAG, SLASH, IDENTIFIER, EQUALS, ATTRIBUTE_VALUE, TEXT, EXPRESSION } from '../src/tokenize';

describe('tokenizer', () => {
  describe('basic tokens', () => {
    it('should tokenize opening tag', () => {
      const tokens = tokenize`<div`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: OPEN_TAG,
        value: '<'
      }));
    });

    it('should tokenize closing tag', () => {
      const tokens = tokenize`<div>`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: CLOSE_TAG,
        value: '>'
      }));
    });

    it('should tokenize slash', () => {
      const tokens = tokenize`<div />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH,
        value: '/'
      }));
    });

    it('should tokenize equals', () => {
      const tokens = tokenize`<div id="app">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: EQUALS,
        value: '='
      }));
    });
  });

  describe('identifiers', () => {
    it('should tokenize simple identifier', () => {
      const tokens = tokenize`<div>`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken).toBeDefined();
      expect(idToken?.value).toBe('div');
    });

    it('should tokenize identifier with hyphens', () => {
      const tokens = tokenize`<my-component>`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('my-component');
    });

    it('should tokenize multiple identifiers', () => {
      const tokens = tokenize`<div id>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER);
      expect(idTokens).toHaveLength(2);
      expect(idTokens[0].value).toBe('div');
      expect(idTokens[1].value).toBe('id');
    });
  });

  describe('text nodes', () => {
    it('should tokenize simple text', () => {
      const tokens = tokenize`Hello`;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken).toBeDefined();
      expect(textToken?.value).toBe('Hello');
    });

    it('should tokenize text with numbers', () => {
      const tokens = tokenize`Hello 123`;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken?.value).toBe('Hello 123');
    });

    it('should skip whitespace-only text', () => {
      const tokens = tokenize`   `;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken).toBeUndefined();
    });

    it('should trim whitespace from text', () => {
      const tokens = tokenize`  Hello World  `;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken?.value).toBe('Hello World');
    });
  });

  describe('attribute values', () => {
    it('should tokenize quoted string', () => {
      const tokens = tokenize`<div id="hello">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE);
      expect(valueToken).toBeDefined();
      expect(valueToken?.value).toBe('hello');
    });

    it('should tokenize single quoted string', () => {
      const tokens = tokenize`<div id='hello'>`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE);
      expect(valueToken?.value).toBe('hello');
    });

    it('should preserve spaces in quoted string', () => {
      const tokens = tokenize`<div class="hello world">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE);
      expect(valueToken?.value).toBe('hello world');
    });

    it('should preserve special characters in quoted string', () => {
      const tokens = tokenize`<div class="class-name with spaces">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE);
      expect(valueToken?.value).toBe('class-name with spaces');
    });

    it('should handle empty quoted string', () => {
      const tokens = tokenize`<div class="">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE);
      expect(valueToken?.value).toBe('');
    });
  });

  describe('expressions', () => {
    it('should tokenize simple expression', () => {
      const value = 'test';
      const tokens = tokenize`${value}`;
      
      const exprToken = tokens.find(t => t.type === EXPRESSION);
      expect(exprToken).toBeDefined();
      expect(exprToken?.value).toBe('test');
      expect(exprToken?.index).toBe(0);
    });

    it('should tokenize multiple expressions', () => {
      const a = 'first';
      const b = 'second';
      const tokens = tokenize`${a}${b}`;
      
      const exprTokens = tokens.filter(t => t.type === EXPRESSION);
      expect(exprTokens).toHaveLength(2);
      expect(exprTokens[0].index).toBe(0);
      expect(exprTokens[1].index).toBe(1);
    });

    it('should preserve expression value', () => {
      const obj = { id: 123 };
      const tokens = tokenize`${obj}`;
      
      const exprToken = tokens.find(t => t.type === EXPRESSION);
      expect(exprToken?.value).toEqual(obj);
    });

    it('should handle expression in attribute', () => {
      const id = 'my-id';
      const tokens = tokenize`<div id=${id}>`;
      
      const exprToken = tokens.find(t => t.type === EXPRESSION);
      expect(exprToken).toBeDefined();
      expect(exprToken?.value).toBe('my-id');
    });

    it('should mark expression in attribute context', () => {
      const id = 'my-id';
      const tokens = tokenize`<div id="${id}">`;
      
      const exprToken = tokens.find(t => t.type === EXPRESSION);
      expect(exprToken?.attrContext).toBe(true);
    });
  });

  describe('position tracking', () => {
    it('should track token start position', () => {
      const tokens = tokenize`<div`;
      
      const openTag = tokens.find(t => t.type === OPEN_TAG);
      expect(openTag?.start).toBe(0);
    });

    it('should track token end position', () => {
      const tokens = tokenize`<div`;
      
      const openTag = tokens.find(t => t.type === OPEN_TAG);
      expect(openTag?.end).toBeGreaterThan(openTag?.start!);
    });

    it('should track multiple token positions', () => {
      const tokens = tokenize`<div id="app">`;
      
      expect(tokens[0].start).toBeLessThan(tokens[1].start!);
      expect(tokens[1].start).toBeLessThan(tokens[2].start!);
    });
  });

  describe('complex examples', () => {
    it('should tokenize element with attributes', () => {
      const tokens = tokenize`<div id="app" class="container">`;
      
      const types = tokens.map(t => t.type);
      expect(types).toContain(OPEN_TAG);
      expect(types).toContain(IDENTIFIER);
      expect(types).toContain(EQUALS);
      expect(types).toContain(ATTRIBUTE_VALUE);
      expect(types).toContain(CLOSE_TAG);
    });

    it('should tokenize self-closing element', () => {
      const tokens = tokenize`<input />`;
      
      const types = tokens.map(t => t.type);
      expect(types).toContain(OPEN_TAG);
      expect(types).toContain(IDENTIFIER);
      expect(types).toContain(SLASH);
      expect(types).toContain(CLOSE_TAG);
    });

    it('should tokenize mixed content', () => {
      const name = 'John';
      const tokens = tokenize`<div>Hello ${name}!</div>`;
      
      const textTokens = tokens.filter(t => t.type === TEXT);
      const exprTokens = tokens.filter(t => t.type === EXPRESSION);
      
      expect(textTokens.length).toBeGreaterThan(0);
      expect(exprTokens).toHaveLength(1);
    });

    it('should tokenize element with dynamic attributes', () => {
      const isActive = true;
      const tokens = tokenize`<div class="btn ${isActive ? 'active' : ''}">`;
      
      const exprTokens = tokens.filter(t => t.type === EXPRESSION);
      expect(exprTokens.length).toBeGreaterThan(0);
    });
  });

  describe('whitespace handling', () => {
    it('should skip whitespace between tokens', () => {
      const tokens = tokenize`<div   id   =   "app">`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER && t.value === 'id');
      expect(idToken).toBeDefined();
    });

    it('should trim text content whitespace', () => {
      const tokens = tokenize`  Hello World  `;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken?.value).toBe('Hello World');
    });

    it('should handle multiline content', () => {
      const tokens = tokenize`<div>
        Hello
      </div>`;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken?.value).toBe('Hello');
    });
  });

  describe('edge cases', () => {
    it('should handle empty template', () => {
      const tokens = tokenize``;
      
      expect(Array.isArray(tokens)).toBe(true);
    });

    it('should handle only whitespace', () => {
      const tokens = tokenize`   `;
      
      expect(tokens.filter(t => t.type === TEXT)).toHaveLength(0);
    });

    it('should handle special characters in text', () => {
      const tokens = tokenize`Hello & goodbye`;
      
      const textToken = tokens.find(t => t.type === TEXT);
      expect(textToken?.value).toContain('&');
    });

    it('should handle consecutive expressions', () => {
      const a = 'first';
      const b = 'second';
      const tokens = tokenize`${a}${b}`;
      
      const exprTokens = tokens.filter(t => t.type === EXPRESSION);
      expect(exprTokens).toHaveLength(2);
    });
  });

  describe('special characters in names', () => {
    it('should tokenize tag with hyphens', () => {
      const tokens = tokenize`<my-component />`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('my-component');
    });

    it('should tokenize tag with periods', () => {
      const tokens = tokenize`<my.component />`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('my.component');
    });

    it('should tokenize tag with colons', () => {
      const tokens = tokenize`<svg:rect />`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('svg:rect');
    });

    it('should tokenize tag with underscores', () => {
      const tokens = tokenize`<my_component />`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('my_component');
    });

    it('should tokenize attribute with hyphens', () => {
      const tokens = tokenize`<div data-id="value">`;
      
      const attrToken = tokens.find((t, i) => t.type === IDENTIFIER && i > 1);
      expect(attrToken?.value).toBe('data-id');
    });

    it('should tokenize attribute with periods', () => {
      const tokens = tokenize`<div xml.namespace="value">`;
      
      const attrToken = tokens.find((t, i) => t.type === IDENTIFIER && i > 1);
      expect(attrToken?.value).toBe('xml.namespace');
    });

    it('should tokenize attribute with colons', () => {
      const tokens = tokenize`<svg svg:width="100">`;
      
      const attrToken = tokens.find((t, i) => t.type === IDENTIFIER && i > 1);
      expect(attrToken?.value).toBe('svg:width');
    });

    it('should tokenize attribute with underscores', () => {
      const tokens = tokenize`<div data_value="test">`;
      
      const attrToken = tokens.find((t, i) => t.type === IDENTIFIER && i > 1);
      expect(attrToken?.value).toBe('data_value');
    });

    it('should tokenize complex names with multiple special characters', () => {
      const tokens = tokenize`<my-custom.component:v2_test />`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER);
      expect(idToken?.value).toBe('my-custom.component:v2_test');
    });
  });
});
