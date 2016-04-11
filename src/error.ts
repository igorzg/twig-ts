import {Token} from './token';

export class InvalidTokenError extends Error {
	constructor(token:Token) {
		super(`
			Invalid token found at line: ${token.lineNumber}, 
			column: ${token.columnNumber}, 
			value: ${token.value},
			tokenType: ${token.type}
		`);
	}
}