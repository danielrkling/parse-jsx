import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('element with attributes', () => {
  bench('baseline', () => {
    jsxBaseline`<div id="app" class="container" data-value="test"></div>`;
  });

  bench('working', () => {
    jsxWorking`<div id="app" class="container" data-value="test"></div>`;
  });
});
