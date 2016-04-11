import {Lexer} from '../lexer';
import {LexerOptions} from '../lexeroptions';
import {readFileSync} from 'fs';
import {assert} from 'chai';

let layout = readFileSync(__dirname + '/../../tmpl/layout.twig', 'utf-8');

describe('Lexer', () => {
	it('Should compile layout.twig', (done) => {
		let lexer = new Lexer(layout, new LexerOptions());
		lexer.parse().then((tokens) => {
			console.log('tokens', tokens);
			done();
		}, (error) => {
			assert.equal(false, error);
			done();
		});
	});
});
