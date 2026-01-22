import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('self-closing element', () => {
  bench('baseline', () => {
    jsxBaseline`<input type="text" placeholder="Enter text" />`;
  });

  bench('working', () => {
    jsxWorking`<input type="text" placeholder="Enter text" />`;
  });
});
