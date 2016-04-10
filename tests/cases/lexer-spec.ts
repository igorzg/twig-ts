import {Lexer} from '../src/lexer';
import {LexerOptions} from '../src/lexeroptions';
import {readFileSync} from 'fs';

let layout = readFileSync(__dirname + '/../../layout.twig', 'utf-8');

describe('Lexer', () => {
	it('Should compile layout.twig', (done) => {
		let lexer = new Lexer(layout, new LexerOptions());
		lexer.parse().then((tokens) => {
			console.log('tokens', tokens);
			debugger;
			done();
		});
	});
});
