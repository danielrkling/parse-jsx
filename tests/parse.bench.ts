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

const simpleExprTemplate = template`<div className=${"cls"} ...${"props"}>Hello ${"name"}!</div>`;

const complexExprTemplate = template`
  <div className=${"cls"} id=${"id"} data-value=${"value"} onClick=${"handleClick"} disabled=${"disabled"}>
    <header>
      <h1>${"title"}</h1>
      <p>${"description"}</p>
    </header>
    <main>
      ${"content"}
      ${"conditional"}
    </main>
    <footer ...${"extraProps"}>${"footerText"}</footer>
    
  </div>
`;

// describe("tokenize - simple", () => {
//   bench("prod", () => {
//     tokenizeProd(simpleTemplate.strings);
//   });

//   bench("dev", () => {
//     tokenizeDev(simpleTemplate.strings);
//   });
// });

// describe("tokenize - complex", () => {
//   bench("prod", () => {
//     tokenizeProd(complexTemplate.strings);
//   });

//   bench("dev", () => {
//     tokenizeDev(complexTemplate.strings);
//   });
// });

// describe("tokenize - nested", () => {
//   bench("prod", () => {
//     tokenizeProd(nestedTemplate.strings);
//   });

//   bench("dev", () => {
//     tokenizeDev(nestedTemplate.strings);
//   });
// });

// describe("parse - simple", () => {
//   bench("prod", () => {
//     parseProd(tokenizeProd(simpleTemplate.strings));
//   });

//   bench("dev", () => {
//     parseDev(tokenizeDev(simpleTemplate.strings));
//   });
// });

// describe("parse - complex", () => {
//   bench("prod", () => {
//     parseProd(tokenizeProd(complexTemplate.strings));
//   });

//   bench("dev", () => {
//     parseDev(tokenizeDev(complexTemplate.strings));
//   });
// });

// describe("parse - nested", () => {
//   bench("prod", () => {
//     parseProd(tokenizeProd(nestedTemplate.strings));
//   });

//   bench("dev", () => {
//     parseDev(tokenizeDev(nestedTemplate.strings));
//   });
// });

describe("full pipeline - simple", () => {
  bench("prod", () => {
    const tokens = tokenizeProd(simpleTemplate.strings);
    parseProd(tokens);
  });

  bench("dev", () => {
    const tokens = tokenizeDev(simpleTemplate.strings);
    parseDev(tokens);
  });
});

describe("full pipeline - complex", () => {
  bench("prod", () => {
    const tokens = tokenizeProd(complexTemplate.strings);
    parseProd(tokens);
  });

  bench("dev", () => {
    const tokens = tokenizeDev(complexTemplate.strings);
    parseDev(tokens);
  });
});

describe("full pipeline - nested", () => {
  bench("prod", () => {
    const tokens = tokenizeProd(nestedTemplate.strings);
    parseProd(tokens);
  });

  bench("dev", () => {
    const tokens = tokenizeDev(nestedTemplate.strings);
    parseDev(tokens);
  });
});

describe("full pipeline - simple expr", () => {
  bench("prod", () => {
    const tokens = tokenizeProd(simpleExprTemplate.strings);
    parseProd(tokens);
  });

  bench("dev", () => {
    const tokens = tokenizeDev(simpleExprTemplate.strings);
    parseDev(tokens);
  });
});

describe("full pipeline - complex expr", () => {
  bench("prod", () => {
    const tokens = tokenizeProd(complexExprTemplate.strings);
    parseProd(tokens);
  });

  bench("dev", () => {
    const tokens = tokenizeDev(complexExprTemplate.strings);
    parseDev(tokens);
  });
});
