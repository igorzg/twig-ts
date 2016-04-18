import {Tokens, Token} from './tokens';
import {async} from './core';
import {InvalidTokenError} from './error';

export class Parser {
	private tokens:Array<Token> = [];
	private instructions: Array<any> = [];
	private str:string;
	private openToken:Tokens = null;

	constructor(str:string, tokens:Array<Token>, instructions: Array<any>) {
		this.str = str;
		this.tokens = tokens;
		this.instructions = instructions;
	}

	/**
	 * Parse
	 * @returns {Promise<any>}
	 */
	parse():Promise<any> {
		let _that = this;
		return async(function* parseToken():any {
			while (_that.tokens.length > 0) {
				yield _that.nextToken();
			}
		});
	}

	/**
	 * Parse statements
	 * @param token
	 */
	private parseStatement(token:Token) {
		if (token.type === Tokens.SYMBOL) {

		}
	}

	/**
	 * Parse expressions
	 * @param token
	 */
	private parseExpression(token:Token) {

	}

	/**
	 * Parse comment
	 * @param token
	 */
	private parseComment(token:Token) {

	}

	/**
	 * Check if token is open token type
	 * @param token
	 * @returns {boolean}
	 */
	private isOpenToken(token:Token):boolean {
		return (
			token.type === Tokens.BLOCK_START ||
			token.type === Tokens.VARIABLE_START ||
			token.type === Tokens.COMMENT_START
		);
	}

	/**
	 * Check if token is close token type
	 * @param token
	 * @returns {boolean}
	 */
	private isCloseToken(token:Token):boolean {
		return (
			token.type === Tokens.BLOCK_END ||
			token.type === Tokens.VARIABLE_END ||
			token.type === Tokens.COMMENT_END
		);
	}

	/**
	 * Peek token
	 * @returns {Token}
	 */
	private peek() {
		return this.tokens.shift();
	}
	/**
	 * Process next token
	 */
	private nextToken() {
		let token = this.peek();
		if (this.isCloseToken(token)) {
			this.openToken = null;
		} else if (this.isOpenToken(token)) {
			this.openToken = token.type;
		} else if (this.openToken === Tokens.BLOCK_START) {
			this.parseStatement(token);
		} else if (this.openToken === Tokens.VARIABLE_START) {
			this.parseExpression(token);
		} else if (this.openToken === Tokens.COMMENT_START) {
			this.parseComment(token);
		} else {
			throw new InvalidTokenError(token);
		}
	}
}