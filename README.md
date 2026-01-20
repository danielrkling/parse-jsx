# jsx-parse

A JSX parser for JavaScript tagged template literals. Designed to parse JSX syntax within template literals and build an AST for further processing.

## Installation

```bash
npm install jsx-parse
```

## Usage

```typescript
import { jsx } from 'jsx-parse';

const html = jsx`
  <div id="app">
    <h1>Hello, ${name}!</h1>
    <p>${message}</p>
  </div>
`;

// Returns an AST with type definitions for further processing
```

## API

### `jsx(strings, ...values)`

Parses JSX from a template literal.

**Parameters:**
- `strings` - Template literal string parts
- `values` - Template literal interpolated values (expressions)

**Returns:** An AST object with the following structure:

```typescript
{
  type: 'Root',
  children: Array<Element | Text | Expression>,
  start: number,
  end: number
}
```

## Building

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:coverage
```

## Type Checking

```bash
npm run type-check
```

## License

MIT
