import {Tokens, Token} from './tokens';
import {async} from './core';
import {ILexerOptions, LexerOptions} from './lexeroptions';

const CHARS_WHITESPACE = ' \n\t\r\u00A0';
const CHARS_DELIMITER = '()[]{}%*-+~/#,:|.<>=!';
const CHARS_INT = '0123456789';
const CHAR_NEW_LINE = '\n';
/**
 * Lexer class
 */
export class Lexer {
	str:string;
	opts:ILexerOptions;
	index:number = 0;
	lineNumber:number = 0;
	columnNumber:number = 0;
	length:number;
	tokens:Array<Token> = [];
	scan:boolean = false;

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
				_that.index += 1;
			}
			return yield _that.tokens;
		});
	}

	/**
	 * Find an token
	 * @param token
	 * @private
	 */
	_isPresent(token:string):boolean {
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
	_extract(token:string):string {
		if (this._isPresent(token)) {
			this.index += token.length;
			return token;
		}
		return null;
	}

	/**
	 * Check if we are at eol
	 * @returns {boolean}
	 */
	isDone():boolean {
		return this.index >= this.length;
	}

	/**
	 * Go forward
	 */
	forward() {
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
	backward() {
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
	current():string {
		return this.str.charAt(this.index);
	}

	/**
	 * Get previous index string
	 * @returns {string}
	 */
	previous():string {
		return this.str.charAt(this.index - 1);
	}


	scanToken() {

	}
	/**
	 * Process tokens
	 */
	nextToken() {
		let tok, startChars = (
			this.opts.BLOCK_START.charAt(0) +
			this.opts.VARIABLE_START.charAt(0) +
			this.opts.COMMENT_START.charAt(0) +
			this.opts.COMMENT_END.charAt(0)
		);
		if (
			(tok = this._extract(this.opts.BLOCK_START + '-')) ||
			(tok = this._extract(this.opts.BLOCK_START))
		) {
			this.scanToken();
			this.tokens.push(
				new Token(
					Tokens.BLOCK_START,
					tok,
					this.lineNumber,
					this.columnNumber
				)
			);
		}
		// console.log('token', this.index);
	}

}

