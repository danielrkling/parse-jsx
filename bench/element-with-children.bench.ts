import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('element with children', () => {
  bench('baseline', () => {
    jsxBaseline`<div>${'child1'}${'child2'}${'child3'}</div>`;
  });

  bench('working', () => {
    jsxWorking`<div>${'child1'}${'child2'}${'child3'}</div>`;
  });
});
