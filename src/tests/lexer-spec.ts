import {Lexer} from '../lexer';
import {LexerOptions} from '../lexeroptions';
import {readFileSync} from 'fs';
import {InvalidTokenError} from '../error';
import {assert} from 'chai';
import {inspect} from 'util';
let layout = readFileSync(__dirname + '/../../tmpl/layout.twig', 'utf-8');

describe('Lexer', () => {
	it('Should compile layout.twig', (done) => {
		let lexer = new Lexer(layout, new LexerOptions());
		console.log(inspect(lexer, {colors: true}));
		lexer.parse().then(
			(tokens) => {
				console.log('tokens', tokens);
				done();
			}
		).catch(done);
	});
});
