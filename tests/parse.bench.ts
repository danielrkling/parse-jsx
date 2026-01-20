import { describe, bench } from 'vitest';
import { jsx } from '../src';

describe('parser benchmarks', () => {
  bench('parse simple element', () => {
    jsx`<div></div>`;
  });

  bench('parse element with attributes', () => {
    jsx`<div id="app" class="container" data-value="test"></div>`;
  });

  bench('parse element with expression attributes', () => {
    const id = 'my-id';
    const className = 'active';
    jsx`<div id="${id}" class="${className}"></div>`;
  });

  bench('parse element with mixed attributes', () => {
    const isActive = true;
    jsx`<div class="btn ${isActive ? 'active' : 'inactive'}" id="button"></div>`;
  });

  bench('parse self-closing element', () => {
    jsx`<input type="text" placeholder="Enter text" />`;
  });

  bench('parse element with spread props', () => {
    const attrs = { id: 'app', role: 'main', ariaLabel: 'Application' };
    jsx`<div ${attrs} />`;
  });

  bench('parse element with children', () => {
    jsx`<div><span>Child 1</span><span>Child 2</span></div>`;
  });

  bench('parse nested elements', () => {
    jsx`<div><section><article><header><h1>Title</h1></header></article></section></div>`;
  });

  bench('parse element with text and expression children', () => {
    const name = 'World';
    jsx`<div>Hello <strong>${name}</strong>!</div>`;
  });

  bench('parse complex structure with multiple attributes', () => {
    const id = 'main';
    const isVisible = true;
    jsx`<div id="${id}" class="container" role="main" ${isVisible ? { dataVisible: 'true' } : {}}>
      Content here
    </div>`;
  });

  bench('parse list with multiple items', () => {
    jsx`<ul>
      <li id="item1" class="list-item">Item 1</li>
      <li id="item2" class="list-item">Item 2</li>
      <li id="item3" class="list-item">Item 3</li>
      <li id="item4" class="list-item">Item 4</li>
      <li id="item5" class="list-item">Item 5</li>
    </ul>`;
  });

  bench('parse with special characters in names', () => {
    jsx`<my-custom:component data-test="value" svg:width="100"></my-custom:component>`;
  });

  bench('parse SVG structure', () => {
    jsx`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100">
      <circle cx="50" cy="50" r="40" fill="blue" />
      <rect x="10" y="10" width="30" height="30" fill="red" />
      <path d="M10 10 L90 90" stroke="green" strokeWidth="2" />
    </svg>`;
  });

  bench('parse form with multiple inputs', () => {
    jsx`<form id="myForm" method="post">
      <label for="username">Username:</label>
      <input id="username" type="text" name="username" required />
      <label for="password">Password:</label>
      <input id="password" type="password" name="password" required />
      <button type="submit">Login</button>
    </form>`;
  });

  bench('parse deeply nested structure', () => {
    jsx`<div>
      <div>
        <div>
          <div>
            <div>
              <p>Deep content</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  });

  bench('parse with multiple expressions and spreads', () => {
    const attrs1 = { id: 'app' };
    const className = 'container';
    const attrs2 = { role: 'main' };
    jsx`<div ${attrs1} class="${className}" ${attrs2}></div>`;
  });
});
