import {Tokens, Token} from "./tokens";
import {isNull} from "./core";
import {LexerOptions} from "./lexeroptions";
import {
  InvalidTokenError,
  InvalidCloseTokenError,
  TokenNotFoundError,
  InvalidOpenTokenError, CloseTokenError
} from "./error";
import {ILexerOptions} from "./interfaces/ilexeroptions";

const CHARS_WHITESPACE = /\s|\n|\t|\r|\u00A0/;
const CHARS_DELIMITER = /\(|\)|\.|\[|]|\{|}|%|\*|\-|\+|~|\/|#|,|:|\||<|>|=|!/;
const CHARS_ALL = /\s|\n|\t|\r|\u00A0|\(|\)|\.|\[|]|\{|}|%|\*|\-|\+|~|\/|#|,|:|\||<|>|=|!/;
const CHARS_NUMBER = /^[0-9]+$/;
const CHARS_BOOLEAN = /^(true|false)$/;
const CHAR_NEW_LINE = "\n";

/**
 * Lexer class
 */
export class Lexer {
  private readonly length: number;
  private index: number = 0;
  private lineNumber: number = 1;
  private columnNumber: number = 1;
  private tokens: Array<Token> = [];
  private tokenType: Tokens = null;

  /**
   * Parse twig file
   * @param {string} str
   * @returns {Lexer}
   */
  static scan(str: string) {
    return new Lexer(str, new LexerOptions());
  }

  /**
   * Constructor
   * @param str
   * @param opts
   */
  constructor(private readonly str: string, private readonly opts: ILexerOptions) {
    this.length = str.length;
  }

  /**
   * Get parsed tokens
   * @returns {Promise<any>}
   */
  async scan(): Promise<{ str: string, tokens: Array<Token> }> {
    while (this.index < this.length) {
      await this.nextToken();
      this.forward();
    }

    if (!isNull(this.tokenType)) {
      throw new CloseTokenError(this.getLastOpenToken());
    }

    return await {
      str: this.str,
      tokens: this.tokens
    };
  }

  /**
   * Last open token
   * @returns {Token}
   */
  private getLastOpenToken(): Token {
    let tokens = this.tokens.slice();
    while (tokens.length > 0) {
      let token = tokens.pop();
      if ([Tokens.BLOCK_START, Tokens.VARIABLE_START, Tokens.COMMENT_START].indexOf(token.type) > -1) {
        return token;
      }
    }
    return new Token(
      Tokens.UNKNOWN,
      null,
      this.lineNumber,
      this.columnNumber
    );
  }

  /**
   * Peek next token
   * @param token
   * @private
   */
  private peekNext(token: string): boolean {
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
  private collect(token: string): string {
    if (this.peekNext(token)) {
      this.forwardN(token.length);
      return token;
    }
    return null;
  }

  /**
   * Collect until
   * @param match
   * @private
   */
  private collectUntil(match: RegExp): string {
    let str = "";
    while (!this.isDone()) {
      if (match.test(this.current())) {
        this.backward();
        break;
      }
      str += this.current();
      this.forward();
    }
    return str;
  }

  /**
   * Check if we are at eol
   * @returns {boolean}
   */
  private isDone(): boolean {
    return this.index > this.length - 2;
  }

  /**
   * Forward
   * @param n
   */
  private forwardN(n: number) {
    while (--n > 0) {
      this.forward();
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
  private current(): string {
    return this.str.charAt(this.index);
  }

  /**
   * Get previous index string
   * @returns {string}
   */
  private previous(): string {
    return this.str.charAt(this.index - 1);
  }

  /**
   * Create instance of token
   * @param type
   * @param token
   * @returns {any}
   */
  private token(type: Tokens, token: string): Token {
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
      (tok = this.collect(this.opts.BLOCK_START + "-")) ||
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
   * Parse string
   * @param delimiter
   */
  private parseString(delimiter) {
    let str = "", isClosed = false;
    this.forward(); // skip first delimiter
    while (!this.isDone()) {
      if (this.peekNext(delimiter)) {
        isClosed = true;
        break;
      }
      str += this.current();
      this.forward();
    }
    if (this.isDone() && !isClosed) {
      throw new InvalidCloseTokenError(
        this.token(
          Tokens.STRING,
          str
        )
      );
    }
    return str;
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
    } else if (CHARS_WHITESPACE.test(this.current()) && !this.isCommentType()) {
      this.token(
        Tokens.WHITESPACE,
        this.current()
      );
    } else if (this.peekNext("\"") && !this.isCommentType()) {
      this.token(
        Tokens.STRING,
        this.parseString("\"")
      );
    } else if (this.peekNext("'") && !this.isCommentType()) {
      this.token(
        Tokens.STRING,
        this.parseString("'")
      );
    } else if (
      !this.isCommentType() &&
      CHARS_DELIMITER.test(this.current())
    ) {
      let operators = [
          "===", "!==", "==", "!=", ">=", "<=", "++",
          "--", ">", "<", "+", "-", "*", "/", "%"
        ],
        tok = this.current(),
        type = null,
        isOperator = false;

      operators.forEach((token) => {
        if (this.peekNext(token)) {
          this.token(
            Tokens.OPERATOR,
            this.collect(token)
          );
          isOperator = true;
        }
      });

      if (!isOperator) {
        switch (tok) {
          case "(":
            type = Tokens.LEFT_PAREN;
            break;
          case ")":
            type = Tokens.RIGHT_PAREN;
            break;
          case "[":
            type = Tokens.LEFT_BRACKET;
            break;
          case "]":
            type = Tokens.RIGHT_BRACKET;
            break;
          case "{":
            type = Tokens.LEFT_CURLY;
            break;
          case "}":
            type = Tokens.RIGHT_CURLY;
            break;
          case ",":
            type = Tokens.COMMA;
            break;
          case ":":
            type = Tokens.COLON;
            break;
          case "~":
            type = Tokens.TILDE;
            break;
          case "|":
            type = Tokens.PIPE;
            break;
          case ".":
            type = Tokens.DOT;
            break;
          case "=":
            type = Tokens.ASSIGNMENT;
            break;
          default:
            throw new InvalidTokenError(
              this.token(
                Tokens.UNKNOWN,
                tok
              )
            );
        }
        this.token(
          type,
          tok
        );
      }
    } else if (!this.isCommentType()) {
      let tok = this.collectUntil(CHARS_ALL);
      if (CHARS_NUMBER.test(tok)) {
        this.token(
          Tokens.NUMBER,
          tok
        );
      } else if (CHARS_BOOLEAN.test(tok)) {
        this.token(
          Tokens.BOOLEAN,
          tok
        );
      } else if (!!tok) {
        this.token(
          Tokens.SYMBOL,
          tok
        );
      } else { // technically this should not happen but if does i need to debug it :)
        throw new InvalidTokenError(
          this.token(
            Tokens.UNKNOWN,
            tok
          )
        );
      }
    }

  }

  /**
   * Collect open token
   * @returns {any}
   */
  private collectOpenToken(): string {
    if (this.peekNext(this.opts.BLOCK_START + "-")) {
      return this.collect(this.opts.BLOCK_START + "-");
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
  private collectCloseToken(): string {
    if (this.peekNext("-" + this.opts.BLOCK_END)) {
      return this.collect("-" + this.opts.BLOCK_END);
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
   * Collect open token
   * @returns {any}
   */
  private getCloseTokenType(): Tokens {
    if (this.peekNext("-" + this.opts.BLOCK_END) || this.peekNext(this.opts.BLOCK_END)) {
      return Tokens.BLOCK_END;
    } else if (this.peekNext(this.opts.VARIABLE_END)) {
      return Tokens.VARIABLE_END;
    } else if (this.peekNext(this.opts.COMMENT_END)) {
      return Tokens.COMMENT_END;
    }
    return null;
  }

  /**
   * Check if next token is opening
   * @returns {boolean}
   */
  private isOpeningToken(): boolean {
    return (
      this.peekNext(this.opts.BLOCK_START + "-") ||
      this.peekNext(this.opts.BLOCK_START) ||
      this.peekNext(this.opts.VARIABLE_START) ||
      this.peekNext(this.opts.COMMENT_START)
    );
  }

  /**
   * Peek next
   * @returns {boolean}
   */
  private isClosingToken(): boolean {
    return (
      this.peekNext("-" + this.opts.BLOCK_END) ||
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
  private isTokenType(type): boolean {
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
   * Close token and run analysis to detect possible errors!
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
    } else if (this.peekNext("-" + this.opts.BLOCK_END) && this.isBlockType()) {
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
   * Get next token, run analysis to detect possible errors!
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
    } else if (this.isClosingToken() && !this.isTokenOpen()) {
      throw new InvalidOpenTokenError(
        this.token(
          this.getCloseTokenType(),
          this.collectCloseToken()
        )
      );
    } else if (this.isTokenOpen()) {
      this.processToken();
    } else {
      this.openToken();
    }
  }
}
