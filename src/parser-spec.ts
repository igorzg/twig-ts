import {Lexer} from "./lexer";
import {LexerOptions} from "./lexeroptions";
import {Parser} from "./parser";
import {readFileSync} from "fs";

let layout = readFileSync(process.cwd() + "/tmpl/layout.twig", "utf-8");

describe("Parser", () => {
  test("Should scan tokens from lexer", (done) => {
    let t1 = (new Date()).getTime();
    let lexer = new Lexer(layout, new LexerOptions());
    lexer.scan().then(
      (data) => {
        let t2 = (new Date()).getTime();
        console.log("TIME", +(t2 - t1));
        expect(data.tokens.length).toBe(253);
        let parser = new Parser(data.str, data.tokens, []);
        return parser.parse();
      }
    ).then(done).catch(done);
  });

});

