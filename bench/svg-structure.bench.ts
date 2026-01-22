import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('SVG structure', () => {
  bench('baseline', () => {
    jsxBaseline`
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="blue" />
        <rect x="10" y="10" width="30" height="30" fill="red" />
        <polygon points="70,10 90,40 70,70 50,45" fill="green" />
      </svg>
    `;
  });

  bench('working', () => {
    jsxWorking`
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="blue" />
        <rect x="10" y="10" width="30" height="30" fill="red" />
        <polygon points="70,10 90,40 70,70 50,45" fill="green" />
      </svg>
    `;
  });
});
