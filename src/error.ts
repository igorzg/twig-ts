import {Token} from './token';

export class InvalidTokenError extends Error {
	constructor(token:Token) {
		super(`Invalid token found at line: ${token.lineNumber}, 
			column: ${token.columnNumber}, 
			value: ${token.value},
			tokenType: ${token.type}`);
	}
}

export class InvalidOpenTokenError extends Error {
	constructor(token:Token) {
		super(`Invalid open token found at line: ${token.lineNumber}, 
			column: ${token.columnNumber}, 
			value: ${token.value},
			tokenType: ${token.type}`);
	}
}

export class InvalidCloseTokenError extends Error {
	constructor(token:Token) {
		super(`Invalid close token found at line: ${token.lineNumber}, 
			column: ${token.columnNumber}, 
			value: ${token.value},
			tokenType: ${token.type}`);
	}
}

export class TokenNotFoundError extends Error {
	constructor(open:Token, close: Token) {
		super(`Unexpected end of input, 
			Token was opened with token: ${open.value} at line ${open.lineNumber} column ${open.columnNumber},
			expected END token should be found at line: ${close.lineNumber}, column: ${close.columnNumber}`);
	}
}
