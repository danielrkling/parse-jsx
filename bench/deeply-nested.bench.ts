import { describe, bench } from 'vitest';
import { jsx as jsxBaseline } from '../src/baseline/index';
import { jsx as jsxWorking } from '../src/index';

describe('deeply nested', () => {
  bench('baseline', () => {
    jsxBaseline`
      <div>
        <div>
          <div>
            <div>
              <div>
                <span>Deep content</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  bench('working', () => {
    jsxWorking`
      <div>
        <div>
          <div>
            <div>
              <div>
                <span>Deep content</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
});
