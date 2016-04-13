import {Tokens, Token} from './tokens';
import {async, isNull} from './core';
import {ILexerOptions, LexerOptions} from './lexeroptions';
import {InvalidTokenError, InvalidCloseTokenError, TokenNotFoundError} from './error';

const CHARS_WHITESPACE = ' \n\t\r\u00A0';
const CHARS_DELIMITER = '()[]{}%*-+~/#,:|.<>=!';
const CHARS_INT = '0123456789';
const CHAR_NEW_LINE = '\n';
/**
 * Lexer class
 */
export class Lexer {
	private str:string;
	private opts:ILexerOptions;
	private index:number = 0;
	private lineNumber:number = 1;
	private columnNumber:number = 1;
	private length:number;
	private tokens:Array<Token> = [];
	private tokenType:Tokens = null;

	/**
	 * Constructor
	 * @param str
	 * @param opts
	 */
	constructor(str:string, opts:ILexerOptions) {
		this.str = str;
		this.length = str.length;
		if (opts instanceof LexerOptions) {
			this.opts = opts;
		} else {
			this.opts = new LexerOptions();
		}
	}

	/**
	 * Parse
	 * @returns {Promise<Token>}
	 */
	parse():Promise<Array<Token>> {
		let _that = this;
		return async(function* parseToken():any {
			while (_that.index < _that.length) {
				yield _that.nextToken();
				_that.forward();
			}
			return yield {
				str: _that.str,
				tokens: _that.tokens
			};
		});
	}

	/**
	 * Peek next token
	 * @param token
	 * @private
	 */
	private peekNext(token:string):boolean {
		if (this.index + token.length <= this.length) {
			return this.str.slice(this.index, this.index + token.length) === token;
		}
		return false;
	}

	/**
	 * Collect
	 * @param token
	 * @private
	 */
	private collect(token:string):string {
		if (this.peekNext(token)) {
			this.forwardN(token.length);
			return token;
		}
		return null;
	}

	/**
	 * Check if we are at eol
	 * @returns {boolean}
	 */
	private isDone():boolean {
		return this.index > this.length - 2;
	}

	/**
	 * Forward
	 * @param n
	 */
	private forwardN(n:number) {
		while (--n > 0) {
			this.forward();
		}
	}

	/**
	 * Go backword for amount of number
	 * @param n
	 */
	private backwordN(n:number) {
		while (--n > 0) {
			this.backward();
		}
	}

	/**
	 * Go forward
	 */
	private forward() {
		this.index++;
		if (this.previous() === CHAR_NEW_LINE) {
			this.lineNumber++;
			this.columnNumber = 0;
		} else {
			this.columnNumber++;
		}
	}

	/**
	 * Go backward
	 */
	private backward() {
		this.index--;
		if (this.current() === CHAR_NEW_LINE) {
			let index = this.str.lastIndexOf(CHAR_NEW_LINE, this.index - 1);
			this.lineNumber--;
			this.columnNumber = index === -1 ? this.index : this.index - index;
		} else {
			this.columnNumber--;
		}
	}

	/**
	 * Get current index string
	 * @returns {string}
	 */
	private current():string {
		return this.str.charAt(this.index);
	}

	/**
	 * Get previous index string
	 * @returns {string}
	 */
	private previous():string {
		return this.str.charAt(this.index - 1);
	}

	/**
	 * Create instance of token
	 * @param type
	 * @param token
	 * @returns {any}
	 */
	private token(type:Tokens, token:string):Token {
		let tok = new Token(
			type,
			token,
			this.lineNumber,
			this.columnNumber
		);
		this.tokens.push(tok);
		return tok;
	}

	/**
	 * Open token
	 */
	private openToken() {
		let tok;
		if (
			(tok = this.collect(this.opts.BLOCK_START + '-')) ||
			(tok = this.collect(this.opts.BLOCK_START))
		) {
			this.tokenType = Tokens.BLOCK_START;
			this.token(Tokens.BLOCK_START, tok);
		} else if (
			(tok = this.collect(this.opts.VARIABLE_START))
		) {
			this.tokenType = Tokens.VARIABLE_START;
			this.token(Tokens.VARIABLE_START, tok);
		} else if (
			(tok = this.collect(this.opts.COMMENT_START))
		) {
			this.tokenType = Tokens.COMMENT_START;
			this.token(Tokens.COMMENT_START, tok);
		}
	}

	/**
	 * Process token
	 */
	private processToken() {
		// closing token
		if (this.isClosingToken()) {
			return this.closeToken();
		} else if (this.isOpeningToken() && !this.isCommentType()) {
			throw new InvalidTokenError(
				this.token(
					this.tokenType,
					this.collectOpenToken()
				)
			);
		}


	}

	/**
	 * Collect open token
	 * @returns {any}
	 */
	private collectOpenToken():string {
		if (this.peekNext(this.opts.BLOCK_START + '-')) {
			return this.collect(this.opts.BLOCK_START + '-');
		} else if (this.peekNext(this.opts.BLOCK_START)) {
			return this.collect(this.opts.BLOCK_START);
		} else if (this.peekNext(this.opts.VARIABLE_START)) {
			return this.collect(this.opts.VARIABLE_START);
		} else if (this.peekNext(this.opts.COMMENT_START)) {
			return this.collect(this.opts.COMMENT_START);
		}
		return null;
	}

	/**
	 * Collect open token
	 * @returns {any}
	 */
	private collectCloseToken():string {
		if (this.peekNext('-' + this.opts.BLOCK_END)) {
			return this.collect('-' + this.opts.BLOCK_END);
		} else if (this.peekNext(this.opts.BLOCK_END)) {
			return this.collect(this.opts.BLOCK_END);
		} else if (this.peekNext(this.opts.VARIABLE_END)) {
			return this.collect(this.opts.VARIABLE_END);
		} else if (this.peekNext(this.opts.COMMENT_END)) {
			return this.collect(this.opts.COMMENT_END);
		}
		return null;
	}

	/**
	 * Check if next token is opening
	 * @returns {boolean}
	 */
	private isOpeningToken():boolean {
		return (
			this.peekNext(this.opts.BLOCK_START + '-') ||
			this.peekNext(this.opts.BLOCK_START) ||
			this.peekNext(this.opts.VARIABLE_START) ||
			this.peekNext(this.opts.COMMENT_START)
		);
	}

	/**
	 * Peek next
	 * @returns {boolean}
	 */
	private isClosingToken():boolean {
		return (
			this.peekNext('-' + this.opts.BLOCK_END) ||
			this.peekNext(this.opts.BLOCK_END) ||
			this.peekNext(this.opts.VARIABLE_END) ||
			this.peekNext(this.opts.COMMENT_END)
		);
	}

	/**
	 * Check if is token open
	 * @returns {boolean}
	 */
	private isTokenOpen() {
		return !isNull(this.tokenType);
	}

	/**
	 * Checck if is token type
	 * @param type
	 * @returns {boolean}
	 */
	private isTokenType(type):boolean {
		return this.tokenType === type;
	}

	/**
	 * Check if token is comment type
	 * @returns {boolean}
	 */
	private isCommentType() {
		return this.isTokenType(Tokens.COMMENT_START);
	}

	/**
	 * Check if token is block type
	 * @returns {boolean}
	 */
	private isBlockType() {
		return this.isTokenType(Tokens.BLOCK_START);
	}

	/**
	 * Check if token is variable type
	 * @returns {boolean}
	 */
	private isVariableType() {
		return this.isTokenType(Tokens.VARIABLE_START);
	}

	/**
	 * Close token
	 */
	private closeToken() {
		if (this.peekNext(this.opts.COMMENT_END) && this.isCommentType()) { // close comment
			this.token(
				Tokens.COMMENT_END,
				this.collectCloseToken()
			);
			this.tokenType = null;
		} else if (this.peekNext(this.opts.BLOCK_END) && this.isBlockType()) { // close block
			this.token(
				Tokens.BLOCK_END,
				this.collectCloseToken()
			);
			this.tokenType = null;
		} else if (this.peekNext('-' + this.opts.BLOCK_END) && this.isBlockType()) {
			this.token(
				Tokens.BLOCK_END,
				this.collectCloseToken()
			);
			this.tokenType = null;
		} else if (this.peekNext(this.opts.VARIABLE_END) && this.isVariableType()) {
			this.token(
				Tokens.VARIABLE_END,
				this.collectCloseToken()
			);
			this.tokenType = null;
		} else if (!this.isCommentType()) {
			throw new InvalidCloseTokenError(
				this.token(
					this.tokenType,
					this.collectCloseToken()
				)
			);
		}
	}

	/**
	 * Process tokens
	 */
	private nextToken() {
		if (this.isTokenOpen() && this.isDone()) {
			throw new TokenNotFoundError(
				this.tokens.slice().pop(),
				this.token(
					this.tokenType,
					this.previous()
				)
			);
		} else if (this.isTokenOpen()) {
			this.processToken();
		} else {
			this.openToken();
		}
	}

}

