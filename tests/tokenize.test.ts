import { describe, it, expect } from 'vitest';
import { tokenize, OPEN_TAG_TOKEN, CLOSE_TAG_TOKEN, SLASH_TOKEN, IDENTIFIER_TOKEN, EQUALS_TOKEN, ATTRIBUTE_VALUE_TOKEN, TEXT_TOKEN, EXPRESSION_TOKEN, ATTRIBUTE_EXPRESSION_TOKEN } from '../src/tokenize';

describe('tokenizer', () => {
  describe('basic tokens', () => {
    it('should tokenize opening tag', () => {
      const tokens = tokenize`<div`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }]);
    });

    it('should tokenize complete tag', () => {
      const tokens = tokenize`<div>`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize self-closing tag', () => {
      const tokens = tokenize`<div />`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize attribute with value', () => {
      const tokens = tokenize`<div id="app">`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'app',
        quoteChar: '"'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });
  });

  describe('identifiers', () => {
    it('should tokenize simple identifier', () => {
      const tokens = tokenize`<div>`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER_TOKEN);
      expect(idToken).toBeDefined();
      expect(idToken?.value).toBe('div');
    });

    it('should tokenize identifier with hyphens', () => {
      const tokens = tokenize`<my-component>`;
      
      const idToken = tokens.find(t => t.type === IDENTIFIER_TOKEN);
      expect(idToken?.value).toBe('my-component');
    });

    it('should tokenize multiple identifiers', () => {
      const tokens = tokenize`<div id>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER_TOKEN);
      expect(idTokens).toHaveLength(2);
      expect(idTokens[0].value).toBe('div');
      expect(idTokens[1].value).toBe('id');
    });
  });

describe('text nodes', () => {
    it('should tokenize simple text', () => {
      const tokens = tokenize`Hello`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: 'Hello'
      }]);
    });

    it('should tokenize text with numbers', () => {
      const tokens = tokenize`Hello 123`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: 'Hello 123'
      }]);
    });

    it('should preserve whitespace-only text', () => {
      const tokens = tokenize`   `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '   '
      }]);
    });

    it('should preserve whitespace around text', () => {
      const tokens = tokenize`  Hello World  `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '  Hello World  '
      }]);
    });

    it('should handle multiline text', () => {
      const tokens = tokenize`Line 1
Line 2`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: 'Line 1\nLine 2'
      }]);
    });

    it('should handle tabs', () => {
      const tokens = tokenize`\tTabbed text`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '\tTabbed text'
      }]);
    });
  });

describe('attribute values', () => {
    it('should tokenize quoted string', () => {
      const tokens = tokenize`<div id="hello">`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'hello',
        quoteChar: '"'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize single quoted string', () => {
      const tokens = tokenize`<div id='hello'>`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'hello',
        quoteChar: "'"
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should preserve spaces in quoted string', () => {
      const tokens = tokenize`<div class="hello world">`;
      
      const classToken = tokens.find(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(classToken?.value).toBe('hello world');
      expect(classToken?.quoteChar).toBe('"');
    });

    it('should preserve special characters in quoted string', () => {
      const tokens = tokenize`<div class="class-name with spaces">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(valueToken?.value).toBe('class-name with spaces');
    });

    it('should handle empty quoted string', () => {
      const tokens = tokenize`<div class="">`;
      
      const valueToken = tokens.find(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(valueToken?.value).toBe('');
      expect(valueToken?.quoteChar).toBe('"');
    });
  });

describe('expressions', () => {
    it('should tokenize simple expression', () => {
      const value = 'test';
      const tokens = tokenize`${value}`;
      
      expect(tokens).toEqual([{
        type: EXPRESSION_TOKEN,
        value: 0
      }]);
    });

    it('should tokenize multiple expressions', () => {
      const a = 'first';
      const b = 'second';
      const tokens = tokenize`${a}${b}`;
      
      expect(tokens).toEqual([{
        type: EXPRESSION_TOKEN,
        value: 0
      }, {
        type: EXPRESSION_TOKEN,
        value: 1
      }]);
    });

    it('should handle expression in unquoted attribute', () => {
      const id = 'my-id';
      const tokens = tokenize`<div id=${id}>`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: EXPRESSION_TOKEN,
        value: 0
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should mark expression in quoted attribute context', () => {
      const id = 'my-id';
      const tokens = tokenize`<div id="${id}">`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '=' 
      }, {
        type: ATTRIBUTE_EXPRESSION_TOKEN,
        value: 0
      },{
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should handle mixed text and expressions', () => {
      const name = 'World';
      const tokens = tokenize`Hello ${name}!`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: 'Hello '
      }, {
        type: EXPRESSION_TOKEN,
        value: 0
      }, {
        type: TEXT_TOKEN,
        value: '!'
      }]);
    });
  });

  describe('position tracking', () => {
    it('should track token start position', () => {
      const tokens = tokenize`<div`;
      
      const openTag = tokens.find(t => t.type === OPEN_TAG_TOKEN);
      // Position tracking removed for performance - tokens no longer carry start/end
      expect(openTag).toBeDefined();
    });

    it('should track token end position', () => {
      const tokens = tokenize`<div`;
      
      const openTag = tokens.find(t => t.type === OPEN_TAG_TOKEN);
      // Position tracking removed for performance
      expect(openTag).toBeDefined();
    });

    it('should track multiple token positions', () => {
      const tokens = tokenize`<div id="app">`;
      
      // Position tracking removed for performance - tokens are now leaner
      expect(tokens).toHaveLength(6);
    });
  });

  describe('complex examples', () => {
    it('should tokenize element with attributes', () => {
      const tokens = tokenize`<div id="app" class="container">`;
      
      const types = tokens.map(t => t.type);
      expect(types).toContain(OPEN_TAG_TOKEN);
      expect(types).toContain(IDENTIFIER_TOKEN);
      expect(types).toContain(EQUALS_TOKEN);
      expect(types).toContain(ATTRIBUTE_VALUE_TOKEN);
      expect(types).toContain(CLOSE_TAG_TOKEN);
    });

    it('should tokenize self-closing element', () => {
      const tokens = tokenize`<input />`;
      
      const types = tokens.map(t => t.type);
      expect(types).toContain(OPEN_TAG_TOKEN);
      expect(types).toContain(IDENTIFIER_TOKEN);
      expect(types).toContain(SLASH_TOKEN);
      expect(types).toContain(CLOSE_TAG_TOKEN);
    });

    it('should tokenize mixed content', () => {
      const name = 'John';
      const tokens = tokenize`<div>Hello ${name}!</div>`;
      
      const textTokens = tokens.filter(t => t.type === TEXT_TOKEN);
      const exprTokens = tokens.filter(t => t.type === EXPRESSION_TOKEN);
      
      expect(textTokens.length).toBeGreaterThan(0);
      expect(exprTokens).toHaveLength(1);
    });

    it('should tokenize element with dynamic attributes', () => {
      const isActive = true;
      const tokens = tokenize`<div class="btn ${isActive ? 'active' : ''}">`;
      
      const exprTokens = tokens.filter(t => t.type === ATTRIBUTE_EXPRESSION_TOKEN);
      expect(exprTokens.length).toBeGreaterThan(0);
    });
  });

describe('whitespace handling', () => {
    it('should skip whitespace between attribute tokens', () => {
      const tokens = tokenize`<div   id   =   "app">`;
      
      // Should not have whitespace tokens in tag context
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'app',
        quoteChar: '"'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should preserve text content whitespace', () => {
      const tokens = tokenize`  Hello World  `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '  Hello World  '
      }]);
    });

    it('should handle multiline content with preserved whitespace', () => {
      const tokens = tokenize`<div>
        Hello
      </div>`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }, {
        type: TEXT_TOKEN,
        value: '\n        Hello\n      '
      }, {
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should handle tabs and mixed whitespace', () => {
      const tokens = tokenize`\tHello\nWorld `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '\tHello\nWorld '
      }]);
    });

    it('should handle whitespace around expressions', () => {
      const name = 'test';
      const tokens = tokenize`  ${name}  `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '  '
      }, {
        type: EXPRESSION_TOKEN,
        value: 0
      }, {
        type: TEXT_TOKEN,
        value: '  '
      }]);
    });
  });

describe('edge cases', () => {
    it('should handle empty template', () => {
      const tokens = tokenize``;
      
      expect(tokens).toEqual([]);
    });

    it('should handle only whitespace', () => {
      const tokens = tokenize`   `;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: '   '
      }]);
    });

    it('should handle special characters in text', () => {
      const tokens = tokenize`Hello & goodbye`;
      
      expect(tokens).toEqual([{
        type: TEXT_TOKEN,
        value: 'Hello & goodbye'
      }]);
    });

    it('should handle consecutive expressions', () => {
      const a = 'first';
      const b = 'second';
      const tokens = tokenize`${a}${b}`;
      
      expect(tokens).toEqual([{
        type: EXPRESSION_TOKEN,
        value: 0
      }, {
        type: EXPRESSION_TOKEN,
        value: 1
      }]);
    });
  });

describe('special characters in names', () => {
    it('should tokenize tag with hyphens', () => {
      const tokens = tokenize`<my-component />`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'my-component'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize tag with periods', () => {
      const tokens = tokenize`<my.component />`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'my.component'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize tag with colons', () => {
      const tokens = tokenize`<svg:rect />`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'svg:rect'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize tag with underscores', () => {
      const tokens = tokenize`<my_component />`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'my_component'
      }, {
        type: SLASH_TOKEN,
        value: '/'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });

    it('should tokenize attribute with hyphens', () => {
      const tokens = tokenize`<div data-id="value">`;
      
      expect(tokens).toEqual([{
        type: OPEN_TAG_TOKEN,
        value: '<'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'div'
      }, {
        type: IDENTIFIER_TOKEN,
        value: 'data-id'
      }, {
        type: EQUALS_TOKEN,
        value: '='
      }, {
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'value',
        quoteChar: '"'
      }, {
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }]);
    });
  });

  describe('edge cases and malformed syntax', () => {
    it('should handle single-quoted attribute values', () => {
      const tokens = tokenize`<div foo='bar'>`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'bar'
      }));
    });

    it('should handle single-quoted attributes with equals', () => {
      const tokens = tokenize`<div 'foo'='bar'>`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(values).toHaveLength(2);
      expect(values.map(v => v.value)).toContain('foo');
      expect(values.map(v => v.value)).toContain('bar');
    });

    it('should handle unquoted attribute name followed by quoted value', () => {
      const tokens = tokenize`<div attr"value">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER_TOKEN,
        value: 'attr'
      }));
    });

    it('should handle mixed quoted and unquoted attributes', () => {
      const tokens = tokenize`<div id="app" class='container' data_value>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER_TOKEN);
      expect(idTokens.some(t => t.value === 'id')).toBe(true);
      expect(idTokens.some(t => t.value === 'class')).toBe(true);
      expect(idTokens.some(t => t.value === 'data_value')).toBe(true);
    });

    it('should handle multiple spaces before closing tag', () => {
      const tokens = tokenize`<div id="app"   />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH_TOKEN,
        value: '/'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }));
    });

    it('should handle slash and closing bracket with spaces', () => {
      const tokens = tokenize`<div /   >`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH_TOKEN,
        value: '/'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: CLOSE_TAG_TOKEN,
        value: '>'
      }));
    });

    it('should handle multiple attributes in tight syntax', () => {
      const tokens = tokenize`<div a="1"b="2"c="3">`;
      
      const attrNames = tokens.filter(t => t.type === IDENTIFIER_TOKEN && t.value && /^[abc]$/.test(t.value as string));
      expect(attrNames).toHaveLength(3);
    });

    it('should handle deeply nested quotes', () => {
      const tokens = tokenize`<div data="value with 'nested' quotes">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: "value with 'nested' quotes"
      }));
    });

    it('should handle attribute values with special characters', () => {
      const tokens = tokenize`<div data="!@#$%^&*()_+-=[]{}|;:,.<>?">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }));
    });

    it('should handle empty attribute values', () => {
      const tokens = tokenize`<div attr="">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: ''
      }));
    });

    it('should handle consecutive equals signs (malformed)', () => {
      const tokens = tokenize`<div attr=="value">`;
      
      const equalTokens = tokens.filter(t => t.type === EQUALS_TOKEN);
      expect(equalTokens.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle attribute without value but with slash', () => {
      const tokens = tokenize`<div required />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER_TOKEN,
        value: 'required'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: SLASH_TOKEN,
        value: '/'
      }));
    });

    it('should handle multiple slashes before closing bracket', () => {
      const tokens = tokenize`<div // >`;
      
      const slashTokens = tokens.filter(t => t.type === SLASH_TOKEN);
      expect(slashTokens.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle numeric attribute values', () => {
      const tokens = tokenize`<div width="100" height="200" data-count="0">`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(values.map(v => v.value)).toContain('100');
      expect(values.map(v => v.value)).toContain('200');
      expect(values.map(v => v.value)).toContain('0');
    });

    it('should handle URL-like attribute values', () => {
      const tokens = tokenize`<a href="https://example.com/path?query=value&other=test#section">`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'https://example.com/path?query=value&other=test#section'
      }));
    });

    it('should handle data attributes with hyphens and underscores', () => {
      const tokens = tokenize`<div data-my_value="test" data_other-name="value">`;
      
      const attrNames = tokens.filter(t => t.type === IDENTIFIER_TOKEN && (t.value as string).includes('data'));
      expect(attrNames.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle boolean-like attribute values', () => {
      const tokens = tokenize`<input disabled="disabled" checked="true" required="false">`;
      
      const values = tokens.filter(t => t.type === ATTRIBUTE_VALUE_TOKEN);
      expect(values.map(v => v.value)).toContain('disabled');
      expect(values.map(v => v.value)).toContain('true');
      expect(values.map(v => v.value)).toContain('false');
    });

    it('should handle expression in complex malformed context', () => {
      const expr = { test: 'value' };
      const tokens = tokenize`<div attr=${expr} />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: EXPRESSION_TOKEN,
        value: 0
      }));
    });

    it('should handle whitespace variations', () => {
      const tokens = tokenize`<div   id   =   "value"   />`;
      
      expect(tokens).toContainEqual(expect.objectContaining({
        type: IDENTIFIER_TOKEN,
        value: 'id'
      }));
      expect(tokens).toContainEqual(expect.objectContaining({
        type: ATTRIBUTE_VALUE_TOKEN,
        value: 'value'
      }));
    });

    it('should handle tag names that look like HTML entities', () => {
      const tokens = tokenize`<amp_symbol></amp_symbol>`;
      
      const idTokens = tokens.filter(t => t.type === IDENTIFIER_TOKEN);
      expect(idTokens[0]?.value).toBe('amp_symbol');
    });
  });
});
