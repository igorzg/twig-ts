import {ILexerOptions} from './interfaces/ilexeroptions';
export {ILexerOptions} from './interfaces/ilexeroptions';
/**
 * Lexer options
 */
export class LexerOptions implements ILexerOptions {
	BLOCK_START = '{%';
	BLOCK_END = '%}';
	VARIABLE_START = '{{';
	VARIABLE_END = '}}';
	COMMENT_START = '{#';
	COMMENT_END = '#}';
	TRIM_BLOCKS = false;
	LEFT_STRIP_BLOCKS = false;
}
