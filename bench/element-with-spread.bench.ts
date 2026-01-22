import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('element with spread props', () => {
  bench('baseline', () => {
    const props = { a: 1, b: 2, c: 3 };
    jsxBaseline`<div ...${props}></div>`;
  });

  bench('working', () => {
    const props = { a: 1, b: 2, c: 3 };
    jsxWorking`<div ...${props}></div>`;
  });
});
