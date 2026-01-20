import { describe, bench } from 'vitest';
import { jsx } from '../src';
import * as html5parser from 'html5parser';

describe('parse-jsx vs html5parser', () => {
  // Simple element tests
  bench('parse-jsx: simple element', () => {
    jsx`<div></div>`;
  });

  bench('html5parser: simple element', () => {
    html5parser.parse('<div></div>');
  });

  // Element with attributes
  bench('parse-jsx: element with attributes', () => {
    jsx`<div id="app" class="container" data-value="test"></div>`;
  });

  bench('html5parser: element with attributes', () => {
    html5parser.parse('<div id="app" class="container" data-value="test"></div>');
  });

  // Self-closing element
  bench('parse-jsx: self-closing element', () => {
    jsx`<input type="text" placeholder="Enter text" />`;
  });

  bench('html5parser: self-closing element', () => {
    html5parser.parse('<input type="text" placeholder="Enter text" />');
  });

  // Nested elements
  bench('parse-jsx: nested elements', () => {
    jsx`<div><section><article><header><h1>Title</h1></header></article></section></div>`;
  });

  bench('html5parser: nested elements', () => {
    html5parser.parse('<div><section><article><header><h1>Title</h1></header></article></section></div>');
  });

  // List with multiple items
  bench('parse-jsx: list with multiple items', () => {
    jsx`<ul>
      <li id="item1" class="list-item">Item 1</li>
      <li id="item2" class="list-item">Item 2</li>
      <li id="item3" class="list-item">Item 3</li>
      <li id="item4" class="list-item">Item 4</li>
      <li id="item5" class="list-item">Item 5</li>
    </ul>`;
  });

  bench('html5parser: list with multiple items', () => {
    html5parser.parse(`<ul>
      <li id="item1" class="list-item">Item 1</li>
      <li id="item2" class="list-item">Item 2</li>
      <li id="item3" class="list-item">Item 3</li>
      <li id="item4" class="list-item">Item 4</li>
      <li id="item5" class="list-item">Item 5</li>
    </ul>`);
  });

  // Form with multiple inputs
  bench('parse-jsx: form with inputs', () => {
    jsx`<form id="myForm" method="post">
      <label for="username">Username:</label>
      <input id="username" type="text" name="username" required />
      <label for="password">Password:</label>
      <input id="password" type="password" name="password" required />
      <button type="submit">Login</button>
    </form>`;
  });

  bench('html5parser: form with inputs', () => {
    html5parser.parse(`<form id="myForm" method="post">
      <label for="username">Username:</label>
      <input id="username" type="text" name="username" required />
      <label for="password">Password:</label>
      <input id="password" type="password" name="password" required />
      <button type="submit">Login</button>
    </form>`);
  });

  // SVG with namespaces
  bench('parse-jsx: SVG structure', () => {
    jsx`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100">
      <circle cx="50" cy="50" r="40" fill="blue" />
      <rect x="10" y="10" width="30" height="30" fill="red" />
      <path d="M10 10 L90 90" stroke="green" strokeWidth="2" />
    </svg>`;
  });

  bench('html5parser: SVG structure', () => {
    html5parser.parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100">
      <circle cx="50" cy="50" r="40" fill="blue" />
      <rect x="10" y="10" width="30" height="30" fill="red" />
      <path d="M10 10 L90 90" stroke="green" strokeWidth="2" />
    </svg>`);
  });
});
