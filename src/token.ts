import {Tokens} from './tokens';
export class Token {
	type:Tokens;
	value:string;
	lineNumber:number;
	columnNumber:number;

	constructor(type:Tokens, value:string, lineNumber:number, columnNumber:number) {
		this.type = type;
		this.value = value;
		this.lineNumber = lineNumber;
		this.columnNumber = columnNumber;
	}
}