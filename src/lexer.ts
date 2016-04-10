import {Tokens, Token} from './tokens';
import {async} from './core';
import {ILexerOptions, LexerOptions} from './lexeroptions';

const CHARS_WHITESPACE = ' \n\t\r\u00A0';
const CHARS_DELIMITER = '()[]{}%*-+~/#,:|.<>=!';
const CHARS_INT = '0123456789';

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
	 * Parse string asynchronously
	 * @returns {Promise<T>|any|Promise<void>|Promise<T>}
	 */
	parse():Promise<Array<Token>> {
		return async(function* _parse() {
			while (this.index < this.length) {
				yield this.nextToken();
			}
			yield this.tokens;
		});
	}

	/**
	 * Process tokens
	 */
	nextToken() {


		this.index += 1;
	}

}

