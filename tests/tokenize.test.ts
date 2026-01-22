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

  describe('edge cases and malformed syntax', () => {
    it('should handle single-quoted attribute values', () => {
      const tokens = tokenize`<div foo='bar'>`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: 'bar'
      }));
    });

    it('should handle single-quoted attributes with equals', () => {
      const tokens = tokenize`<div 'foo'='bar'>`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE);
      expect(values).toHaveLength(2);
      expect(values.map(v => v.value)).toContain('foo');
      expect(values.map(v => v.value)).toContain('bar');
    });

    it('should handle unquoted attribute name followed by quoted value', () => {
      const tokens = tokenize`<div attr"value">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER,
        value: 'attr'
      }));
    });

    it('should handle mixed quoted and unquoted attributes', () => {
      const tokens = tokenize`<div id="app" class='container' data_value>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER);
      expect(idTokens.some(t => t.value === 'id')).toBe(true);
      expect(idTokens.some(t => t.value === 'class')).toBe(true);
      expect(idTokens.some(t => t.value === 'data_value')).toBe(true);
    });

    it('should handle multiple spaces before closing tag', () => {
      const tokens = tokenize`<div id="app"   />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH,
        value: '/'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: CLOSE_TAG,
        value: '>'
      }));
    });

    it('should handle slash and closing bracket with spaces', () => {
      const tokens = tokenize`<div /   >`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH,
        value: '/'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: CLOSE_TAG,
        value: '>'
      }));
    });

    it('should handle multiple attributes in tight syntax', () => {
      const tokens = tokenize`<div a="1"b="2"c="3">`;
      
      const attrNames = tokens.filter(t => t.type === IDENTIFIER && t.value && /^[abc]$/.test(t.value as string));
      expect(attrNames).toHaveLength(3);
    });

    it('should handle deeply nested quotes', () => {
      const tokens = tokenize`<div data="value with 'nested' quotes">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: "value with 'nested' quotes"
      }));
    });

    it('should handle attribute values with special characters', () => {
      const tokens = tokenize`<div data="!@#$%^&*()_+-=[]{}|;:,.<>?">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }));
    });

    it('should handle empty attribute values', () => {
      const tokens = tokenize`<div attr="">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: ''
      }));
    });

    it('should handle consecutive equals signs (malformed)', () => {
      const tokens = tokenize`<div attr=="value">`;
      
      const equalTokens = tokens.filter(t => t.type === EQUALS);
      expect(equalTokens.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle attribute without value but with slash', () => {
      const tokens = tokenize`<div required />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER,
        value: 'required'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH,
        value: '/'
      }));
    });

    it('should handle multiple slashes before closing bracket', () => {
      const tokens = tokenize`<div // >`;
      
      const slashTokens = tokens.filter(t => t.type === SLASH);
      expect(slashTokens.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle numeric attribute values', () => {
      const tokens = tokenize`<div width="100" height="200" data-count="0">`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE);
      expect(values.map(v => v.value)).toContain('100');
      expect(values.map(v => v.value)).toContain('200');
      expect(values.map(v => v.value)).toContain('0');
    });

    it('should handle URL-like attribute values', () => {
      const tokens = tokenize`<a href="https://example.com/path?query=value&other=test#section">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: 'https://example.com/path?query=value&other=test#section'
      }));
    });

    it('should handle data attributes with hyphens and underscores', () => {
      const tokens = tokenize`<div data-my_value="test" data_other-name="value">`;
      
      const attrNames = tokens.filter(t => t.type === IDENTIFIER && (t.value as string).includes('data'));
      expect(attrNames.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle boolean-like attribute values', () => {
      const tokens = tokenize`<input disabled="disabled" checked="true" required="false">`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE);
      expect(values.map(v => v.value)).toContain('disabled');
      expect(values.map(v => v.value)).toContain('true');
      expect(values.map(v => v.value)).toContain('false');
    });

    it('should handle expression in complex malformed context', () => {
      const expr = { test: 'value' };
      const tokens = tokenize`<div attr=${expr} />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: EXPRESSION,
        value: expr
      }));
    });

    it('should handle whitespace variations', () => {
      const tokens = tokenize`<div   id   =   "value"   />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER,
        value: 'id'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE,
        value: 'value'
      }));
    });

    it('should handle tag names that look like HTML entities', () => {
      const tokens = tokenize`<amp_symbol></amp_symbol>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER);
      expect(idTokens[0]?.value).toBe('amp_symbol');
    });
  });
});
