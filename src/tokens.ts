export {Token} from './token';

export enum Tokens {
  STRING,
  WHITESPACE,
  BLOCK_START,
  BLOCK_END,
  VARIABLE_START,
  VARIABLE_END,
  COMMENT_START,
  COMMENT_END,
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  LEFT_CURLY,
  RIGHT_CURLY,
  OPERATOR,
  COMMA,
  DOT,
  ASSIGNMENT,
  COLON,
  TILDE,
  PIPE,
  NUMBER,
  BOOLEAN,
  SYMBOL,
  UNKNOWN
}

/**
 * Return token name
 * @param token
 * @returns {any}
 */
export function getTokenName(token: Tokens): string {
  switch (token) {
    case Tokens.STRING:
      return 'STRING';
    case Tokens.WHITESPACE:
      return 'WHITESPACE';
    case Tokens.BLOCK_START:
      return 'BLOCK_START';
    case Tokens.BLOCK_END:
      return 'BLOCK_END';
    case Tokens.VARIABLE_START:
      return 'VARIABLE_START';
    case Tokens.VARIABLE_END:
      return 'VARIABLE_END';
    case Tokens.COMMENT_START:
      return 'COMMENT_START';
    case Tokens.COMMENT_END:
      return 'COMMENT_END';
    case Tokens.LEFT_PAREN:
      return 'LEFT_PAREN';
    case Tokens.RIGHT_PAREN:
      return 'RIGHT_PAREN';
    case Tokens.LEFT_BRACKET:
      return 'LEFT_BRACKET';
    case Tokens.RIGHT_BRACKET:
      return 'RIGHT_BRACKET';
    case Tokens.LEFT_CURLY:
      return 'LEFT_CURLY';
    case Tokens.RIGHT_CURLY:
      return 'RIGHT_CURLY';
    case Tokens.OPERATOR:
      return 'OPERATOR';
    case Tokens.COMMA:
      return 'COMMA';
    case Tokens.DOT:
      return 'DOT';
    case Tokens.ASSIGNMENT:
      return 'ASSIGNMENT';
    case Tokens.COLON:
      return 'COLON';
    case Tokens.TILDE:
      return 'TILDE';
    case Tokens.PIPE:
      return 'PIPE';
    case Tokens.NUMBER:
      return 'NUMBER';
    case Tokens.BOOLEAN:
      return 'BOOLEAN';
    case Tokens.SYMBOL:
      return 'SYMBOL';
    case Tokens.UNKNOWN:
      return 'UNKNOWN';
    default:
      throw new Error('Invalid token type: ' + token);
  }
}
