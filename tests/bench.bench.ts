import { describe, bench } from "vitest";
import { tokenize as tokenizeProd, parse as parseProd } from "../src/index";
import { tokenize as tokenizeDev, parse as parseDev } from "../src/dev";

const template = (strings: TemplateStringsArray, ...values: any[]) => ({ strings, values });

const simpleTemplate = template`<div class="container"><h1>Hello</h1><p>World</p></div>`;

const complexTemplate = template`
  <div class="app" data-id="123">
    <header class="header">
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
    <main>
      <article>
        <h1>Title</h1>
        <p>Content here</p>
        <span>More content</span>
      </article>
      <aside>
        <div>Sidebar</div>
      </aside>
    </main>
    <footer>Footer</footer>
  </div>
`;

const nestedTemplate = template`<div><section><article><p><span>deep</span></p></article></section></div>`;

describe("tokenize benchmark", () => {
  bench("prod - simple", () => {
    tokenizeProd(simpleTemplate.strings);
  });

  bench("dev - simple", () => {
    tokenizeDev(simpleTemplate.strings);
  });

  bench("prod - complex", () => {
    tokenizeProd(complexTemplate.strings);
  });

  bench("dev - complex", () => {
    tokenizeDev(complexTemplate.strings);
  });

  bench("prod - nested", () => {
    tokenizeProd(nestedTemplate.strings);
  });

  bench("dev - nested", () => {
    tokenizeDev(nestedTemplate.strings);
  });
});

describe("parse benchmark", () => {
  bench("prod - simple", () => {
    parseProd(tokenizeProd(simpleTemplate.strings));
  });

  bench("dev - simple", () => {
    parseDev(tokenizeDev(simpleTemplate.strings));
  });

  bench("prod - complex", () => {
    parseProd(tokenizeProd(complexTemplate.strings));
  });

  bench("dev - complex", () => {
    parseDev(tokenizeDev(complexTemplate.strings));
  });

  bench("prod - nested", () => {
    parseProd(tokenizeProd(nestedTemplate.strings));
  });

  bench("dev - nested", () => {
    parseDev(tokenizeDev(nestedTemplate.strings));
  });
});

describe("full pipeline benchmark", () => {
  bench("prod - simple", () => {
    const tokens = tokenizeProd(simpleTemplate.strings);
    parseProd(tokens);
  });

  bench("dev - simple", () => {
    const tokens = tokenizeDev(simpleTemplate.strings);
    parseDev(tokens);
  });

  bench("prod - complex", () => {
    const tokens = tokenizeProd(complexTemplate.strings);
    parseProd(tokens);
  });

  bench("dev - complex", () => {
    const tokens = tokenizeDev(complexTemplate.strings);
    parseDev(tokens);
  });

  bench("prod - nested", () => {
    const tokens = tokenizeProd(nestedTemplate.strings);
    parseProd(tokens);
  });

  bench("dev - nested", () => {
    const tokens = tokenizeDev(nestedTemplate.strings);
    parseDev(tokens);
  });
});
