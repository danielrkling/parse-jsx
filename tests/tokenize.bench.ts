import { describe, bench } from 'vitest';
import { tokenize } from '../src/tokenize';

describe('tokenizer benchmarks', () => {
  bench('tokenize simple element', () => {
    tokenize`<div></div>`;
  });

  bench('tokenize element with attribute', () => {
    tokenize`<div id="app" class="container"></div>`;
  });

  bench('tokenize element with multiple attributes', () => {
    tokenize`<div id="app" class="container" data-value="test" aria-label="click me"></div>`;
  });

  bench('tokenize self-closing element', () => {
    tokenize`<input type="text" placeholder="Enter name" />`;
  });

  bench('tokenize element with expression attribute', () => {
    const id = 'my-id';
    tokenize`<div id="${id}"></div>`;
  });

  bench('tokenize element with mixed attribute', () => {
    const active = true;
    tokenize`<div class="btn ${active ? 'active' : 'inactive'}"></div>`;
  });

  bench('tokenize nested elements', () => {
    tokenize`<div><p>Hello</p><span>World</span></div>`;
  });

  bench('tokenize deeply nested elements', () => {
    tokenize`<div><section><article><header><h1>Title</h1></header></article></section></div>`;
  });

  bench('tokenize element with spread props', () => {
    const attrs = { id: 'app', role: 'main' };
    tokenize`<div ${attrs} />`;
  });

  bench('tokenize element with special characters in names', () => {
    tokenize`<my-custom:component data-value="test" svg:width="100"></my-custom:component>`;
  });

  bench('tokenize element with text content', () => {
    tokenize`<div>This is some text content with special chars: !@#$%^&*()</div>`;
  });

  bench('tokenize element with mixed content', () => {
    const name = 'World';
    tokenize`<div>Hello <strong>${name}</strong>! How are you?</div>`;
  });

  bench('tokenize large element list', () => {
    tokenize`<ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
      <li>Item 5</li>
    </ul>`;
  });

  bench('tokenize SVG with namespaces', () => {
    tokenize`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="blue" />
      <rect x="10" y="10" width="30" height="30" fill="red" />
    </svg>`;
  });

  bench('tokenize with multiple expressions', () => {
    const a = 'first';
    const b = 'second';
    const c = 'third';
    tokenize`<div>${a} and ${b} and ${c}</div>`;
  });
});
