import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('simple element', () => {
  bench('baseline', () => {
    jsxBaseline`<div></div>`;
  });

  bench('working', () => {
    jsxWorking`<div></div>`;
  });
});
