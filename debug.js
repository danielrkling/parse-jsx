import { tokenize } from './dist/index.mjs';
import { jsx } from './dist/index.mjs';

const ast = jsx`<div class="container">
  <h1>Hello, World!</h1>
  <p>This is a sample JSX snippet.</p>
</div>`;

console.log('AST:', JSON.stringify(ast, null, 2));