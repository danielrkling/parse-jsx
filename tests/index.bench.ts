import { bench, describe } from "vitest";
import { jsx, parse } from "../src";
import { jsx as jsxNew } from "../src-new";

describe("Simple JSX", () => {
  bench("Current", () => {
    const ast = jsx`<div class="container"><h1>Hello, World!</h1><p>This is a simple JSX parsing benchmark.</p></div>`;
  });

  bench("New", () => {
    const ast = jsxNew`<div class="container"><h1>Hello, World!</h1><p>This is a simple JSX parsing benchmark.</p></div>`;
  });
});

describe("Parse JSX with expressions", () => {
  bench("Current", () => {
    const title = "Benchmark Title";
    const content = "This is dynamic content.";
    const ast = jsx`<section><header><h2>${title}</h2></header><article><p>${content}</p></article></section>`;
  });
  bench("New", () => {
    const title = "Benchmark Title";
    const content = "This is dynamic content.";
    const ast = jsxNew`<section><header><h2>${title}</h2></header><article><p>${content}</p></article></section>`;
  });
});

describe("Complex JSX Structures", () => {
  bench("Current", () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    const ast = jsx`<div><ul>${items.map((item) => `<li>${item}</li>`)}</ul><footer>End of List</footer></div>`;
  });
  bench("New", () => {
    const items = ["Item 1", "Item 2", "Item 3"];
    const ast = jsxNew`<div><ul>${items.map((item) => `<li>${item}</li>`)}</ul><footer>End of List</footer></div>`;
  });
});

describe("Parse JSX with mixed props", () => {
  bench("Current", () => {
    const isActive = true;
    const count = 5;
    const ast = jsx`<button class="btn ${isActive ? "active" : ""}" data-count=${count} disabled=${isActive}>Click Me</button>`;
  });
  bench("New", () => {
    const isActive = true;
    const count = 5;
    const ast = jsxNew`<button class="btn ${isActive ? "active" : ""}" data-count=${count} disabled=${isActive}>Click Me</button>`;
  });
});

describe("Large JSX Structure", () => {
  bench("Current", () => {
    const ast = jsx`<div>
  <header>
    <h1>Large JSX Structure</h1>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
  </header>
    <main>
        <section>
            <h2>Welcome to Our Website</h2>
            <p>This is a large JSX structure used for benchmarking the parsing performance of the JSX parser.</p>
        </section>          
        <section>
            <h2>Our Services</h2>
            <ul>
                <li>Service 1</li>  
                <li>Service 2</li>
                <li>Service 3</li>
            </ul>
        </section>
    </main>
  <footer>
    <p>&copy; 2024 Large JSX Benchmark</p>
  </footer>
</div>`;
  });

  bench("New", () => {
    const ast = jsxNew`<div>
 <header>
    <h1>Large JSX Structure</h1>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
  </header>
    <main>
        <section>
            <h2>Welcome to Our Website</h2>
            <p>This is a large JSX structure used for benchmarking the parsing performance of the JSX parser.</p>
        </section>          
        <section>
            <h2>Our Services</h2>
            <ul>
                <li>Service 1</li>  
                <li>Service 2</li>
                <li>Service 3</li>
            </ul>
        </section>
    </main>
  <footer>
    <p>&copy; 2024 Large JSX Benchmark</p>
  </footer>
</div>`;
  });
});
