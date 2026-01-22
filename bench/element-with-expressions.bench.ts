import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('element with expression attributes', () => {
  bench('baseline', () => {
    jsxBaseline`<div id=${'dynamic'} class=${'test'} data=${'value'}></div>`;
  });

  bench('working', () => {
    jsxWorking`<div id=${'dynamic'} class=${'test'} data=${'value'}></div>`;
  });
});
