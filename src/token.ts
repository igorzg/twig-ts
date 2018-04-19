import {Tokens, getTokenName} from "./tokens";

export class Token {
  type: Tokens;
  value: any;
  tokenName: string;
  lineNumber: number;
  columnNumber: number;

  constructor(type: Tokens, value: any, lineNumber: number, columnNumber: number) {
    this.type = type;
    this.value = value;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
    this.tokenName = getTokenName(type);
  }
}
