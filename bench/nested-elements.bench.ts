import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('nested elements', () => {
  bench('baseline', () => {
    jsxBaseline`<div><span>Hello</span><span>World</span></div>`;
  });

  bench('working', () => {
    jsxWorking`<div><span>Hello</span><span>World</span></div>`;
  });
});
