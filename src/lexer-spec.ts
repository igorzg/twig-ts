import {Lexer} from "./lexer";
import {LexerOptions} from "./lexeroptions";
import {Tokens, getTokenName} from "./tokens";
import {readFileSync} from "fs";

let layout = readFileSync(process.cwd() + "/tmpl/layout.twig", "utf-8");
let layoutTokens = JSON.parse(
  readFileSync(process.cwd() + "/tmpl/layout-tokens.json", "utf-8")
);

describe("Lexer", () => {
  test("Should give correct lexical analysis of layout.twig", (done) => {
    let t1 = (new Date()).getTime();
    let lexer1 = new Lexer(layout, new LexerOptions());
    Promise.all([
      lexer1.scan().then(
        (data) => {
          expect(data.tokens).toEqual(layoutTokens);
          expect(data.tokens.length).toBe(253);
        }
      )
    ])
      .then(() => {
        let t2 = (new Date()).getTime();
        console.log("TIME", +(t2 - t1));
        done();
      })
      .catch((error) => {
        let t2 = (new Date()).getTime();
        console.log("TIME IN ERROR", +(t2 - t1));
        done(error);
      });
  });


  test("Should open and close block", (done) => {
    let template = `<div>
             {% %}
    </div>`;
    let lexer = new Lexer(template, new LexerOptions());
    lexer.scan().then(
      (data) => {
        expect(data.tokens).toEqual([
          {
            columnNumber: 14,
            lineNumber: 2,
            tokenName: "BLOCK_START",
            type: Tokens.BLOCK_START,
            value: "{%"
          },
          {
            columnNumber: 15,
            lineNumber: 2,
            tokenName: "WHITESPACE",
            type: Tokens.WHITESPACE,
            value: " "
          },
          {
            columnNumber: 17,
            lineNumber: 2,
            tokenName: "BLOCK_END",
            type: Tokens.BLOCK_END,
            value: "%}"
          }
        ]);
        done();
      }
    ).catch(done);
  });

  test("Should open and close variable", (done) => {
    let template = `<div>{{ value }}</div>`;
    let lexer = new Lexer(template, new LexerOptions());
    lexer.scan().then(
      (data) => {
        expect(data.tokens).toEqual([
          {
            columnNumber: 7,
            lineNumber: 1,
            tokenName: "VARIABLE_START",
            type: Tokens.VARIABLE_START,
            value: "{{"
          },
          {
            columnNumber: 8,
            lineNumber: 1,
            tokenName: "WHITESPACE",
            type: Tokens.WHITESPACE,
            value: " "
          },
          {
            columnNumber: 13,
            lineNumber: 1,
            tokenName: "SYMBOL",
            type: Tokens.SYMBOL,
            value: "value"
          },
          {
            columnNumber: 14,
            lineNumber: 1,
            tokenName: "WHITESPACE",
            type: Tokens.WHITESPACE,
            value: " "
          },
          {
            columnNumber: 16,
            lineNumber: 1,
            tokenName: "VARIABLE_END",
            type: Tokens.VARIABLE_END,
            value: "}}"
          }
        ]);
        done();
      }
    ).catch(done);
  });

  test("Should open and close comment", (done) => {
    let template = `<div>{# this is some comment {{}} #}</div>`;
    let lexer = new Lexer(template, new LexerOptions());
    lexer.scan().then(
      (data) => {
        expect(data.tokens).toEqual([
          {
            columnNumber: 7,
            lineNumber: 1,
            tokenName: "COMMENT_START",
            type: Tokens.COMMENT_START,
            value: "{#"
          },
          {
            columnNumber: 36,
            lineNumber: 1,
            tokenName: "COMMENT_END",
            type: Tokens.COMMENT_END,
            value: "#}"
          }
        ]);
        done();
      }
    ).catch(done);
  });

  test("Should throw InvalidOpenTokenError", (done) => {
    let lexer = new Lexer(`This is an test #} and it should throw error`, new LexerOptions());
    lexer.scan().then(null, (error) => {
      expect(error.message).toContain("Invalid open token found at line: 1");
      expect(error.message).toContain("column: 18");
      expect(error.message).toContain("value: #}");
      expect(error.message).toContain("tokenType: " + Tokens.COMMENT_END);
      expect(error.message).toContain("tokenName: " + getTokenName(Tokens.COMMENT_END));
      done();
    }).catch(done);
  });

  test("Should throw TokenNotFoundError", (done) => {
    let lexer = new Lexer(`This is an test 
    {# and it should throw error`, new LexerOptions());
    lexer.scan().then(null, (error) => {
      expect(error.message).toContain("Unexpected end of input");
      expect(error.message).toContain("Token was opened with token: {# at line 2 column 5");
      expect(error.message).toContain("expected END token should be found at line: 2, column: 31");
      done();
    }).catch(done);
  });

  test("Should throw InvalidCloseTokenError", (done) => {
    let lexer = new Lexer(`This is an test 
    {% and it should throw #} error`, new LexerOptions());
    lexer.scan().then(null, (error) => {
      expect(error.message).toContain("Invalid close token found at line: 2");
      expect(error.message).toContain("column: 28");
      expect(error.message).toContain("value: #}");
      expect(error.message).toContain("tokenType: " + Tokens.BLOCK_START);
      expect(error.message).toContain("tokenName: " + getTokenName(Tokens.BLOCK_START));
      done();
    }).catch(done);
  });

  test("Should throw InvalidTokenError {%", (done) => {
    let lexer = new Lexer(`This is an test 
    {% {% token %} and it should throw  error`, new LexerOptions());
    lexer.scan().then(null, (error) => {
      expect(error.message).toContain("Invalid token found at line: 2");
      expect(error.message).toContain("column: 8");
      expect(error.message).toContain("value: {%");
      expect(error.message).toContain("tokenType: " + Tokens.BLOCK_START);
      expect(error.message).toContain("tokenName: " + getTokenName(Tokens.BLOCK_START));
      done();
    }).catch(done);
  });

  test("Should throw InvalidTokenError {{", (done) => {
    let lexer = new Lexer(`This is an test 
    {{ {{ token }} and it should throw  error`, new LexerOptions());
    lexer.scan().then(null, (error) => {
      expect(error.message).toContain("Invalid token found at line: 2");
      expect(error.message).toContain("column: 8");
      expect(error.message).toContain("value: {{");
      expect(error.message).toContain("tokenType: " + Tokens.VARIABLE_START);
      expect(error.message).toContain("tokenName: " + getTokenName(Tokens.VARIABLE_START));
      done();
    }).catch(done);
  });

});
