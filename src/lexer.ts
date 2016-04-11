import {Tokens, Token} from './tokens';
import {async, isNull} from './core';
import {ILexerOptions, LexerOptions} from './lexeroptions';
import {InvalidTokenError} from './error';

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
	private inToken:Tokens = null;

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
			return yield _that.tokens;
		});
	}

	/**
	 * Find an token
	 * @param token
	 * @private
	 */
	private isPresent(token:string):boolean {
		if (this.index + token.length <= this.length) {
			return this.str.slice(this.index, this.index + token.length) === token;
		}
		return false;
	}

	/**
	 * Extract
	 * @param token
	 * @private
	 */
	private extract(token:string):string {
		if (this.isPresent(token)) {
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
		return this.index >= this.length;
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
	 * Process tokens
	 */
	private nextToken() {
		let tok;

		if (!isNull(this.inToken)) {

			if (this.inToken !== Tokens.COMMENT_START) {
				if (this.isPresent(this.opts.BLOCK_START + '-') || this.isPresent(this.opts.BLOCK_START)) {
					throw new InvalidTokenError(
						this.token(
							Tokens.BLOCK_START,
							this.extract(this.opts.BLOCK_START)
						)
					);
				} else if (this.isPresent(this.opts.VARIABLE_START)) {
					throw new InvalidTokenError(
						this.token(
							Tokens.VARIABLE_START,
							this.extract(this.opts.VARIABLE_START)
						)
					);
				}
			} else {

			}
		} else if (
			(tok = this.extract(this.opts.BLOCK_START + '-')) ||
			(tok = this.extract(this.opts.BLOCK_START))
		) {
			this.inToken = Tokens.BLOCK_START;
			this.token(Tokens.BLOCK_START, tok);
		} else if (
			(tok = this.extract(this.opts.VARIABLE_START))
		) {
			this.inToken = Tokens.VARIABLE_START;
			this.token(Tokens.VARIABLE_START, tok);
		} else if (
			(tok = this.extract(this.opts.COMMENT_START))
		) {
			this.inToken = Tokens.COMMENT_START;
			this.token(Tokens.COMMENT_START, tok);
		}
	}

}

