import { Token } from "./tokenize-dev";

export class ParseJSXError extends Error {
  constructor(
    message: string,
    public token?: Token
  ) {
    super(message);
    this.name = "ParseJSXError";
  }
}
