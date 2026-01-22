import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('form with inputs', () => {
  bench('baseline', () => {
    jsxBaseline`
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Submit</button>
      </form>
    `;
  });

  bench('working', () => {
    jsxWorking`
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Submit</button>
      </form>
    `;
  });
});
