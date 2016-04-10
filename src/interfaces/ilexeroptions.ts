/**
 * Lexer options interface
 */
export interface ILexerOptions {
	BLOCK_START:string;
	BLOCK_END:string;
	VARIABLE_START:string;
	VARIABLE_END:string;
	COMMENT_START:string;
	COMMENT_END:string;
	TRIM_BLOCKS: boolean;
	LEFT_STRIP_BLOCKS: boolean;
}
