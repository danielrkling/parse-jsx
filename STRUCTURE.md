# Project Structure: Baseline vs Working

## Organization

```
src/
  ├── baseline/           ← Frozen checkpoint (current implementation)
  │   ├── index.ts
  │   ├── parse.ts
  │   └── tokenize.ts
  ├── index.ts            ← Working implementation (same initially)
  ├── parse.ts
  └── tokenize.ts

bench/                     ← Comparison benchmarks
  ├── tokenize-comparison.bench.ts
  ├── parse-comparison.bench.ts
  └── jsx-comparison.bench.ts

tests/                     ← Unit tests (unchanged)
  ├── tokenize.test.ts
  ├── parse.test.ts
  └── parse.bench.ts
```

## Workflow

1. **Baseline is set** - `src/baseline/` contains your current optimized version
2. **Working copy** - Edit files in `src/` directly (starts as copy of baseline)
3. **Benchmarks** - Run `npm run bench` to automatically compare both versions
4. **Iterate** - Make changes, compare, repeat

## Running Benchmarks

```bash
npm run bench -- --run
```

This runs all benchmarks including:
- `tokenize-comparison.bench.ts` - Baseline vs Working tokenizer
- `parse-comparison.bench.ts` - Baseline vs Working parser  
- `jsx-comparison.bench.ts` - Baseline vs Working full JSX
- `tests/parse.bench.ts` - Original parse benchmarks

Output shows side-by-side comparison with Hz measurements showing which is faster.

## Example Output

```
✓ working: simple element                  1,299,980.12 Hz (fastest)
  baseline: simple element                 1,208,700.31 Hz

→ working is 7.5% faster
```

## Making Optimizations

1. Edit `src/tokenize.ts`, `src/parse.ts`, or `src/index.ts`
2. Run `npm run bench -- --run`
3. Benchmarks automatically show if you're faster or slower than baseline
4. When happy, copy improvements back to `src/baseline/` and repeat

## Resetting to Baseline

```bash
Copy-Item src/baseline/*.ts src/ -Force
```

## Integration with Comparison Tools

Original comparison/baseline scripts (`npm run baseline`, `npm run compare`) still work:

```bash
npm run baseline    # Capture full baseline metrics
npm run compare     # Compare current to baseline
npm run record "v1" # Record timestamped snapshot
```

But the bench folder provides real-time side-by-side Hz comparison during development!
