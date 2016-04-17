import {Lexer} from '../lexer';
import {LexerOptions} from '../lexeroptions';
import {Tokens} from '../tokens';
import {readFileSync} from 'fs';
import {InvalidTokenError} from '../error';
import {assert} from 'chai';
let layout = readFileSync(__dirname + '/../../tmpl/layout.twig', 'utf-8');
let layoutTokens = JSON.parse(
	readFileSync(__dirname + '/../../tmpl/layout-tokens.json', 'utf-8')
);

describe('Lexer', () => {
	it('Should give correct lexical analysis of layout.twig', (done) => {
		let t1 = (new Date()).getTime();
		let lexer1 = new Lexer(layout, new LexerOptions());
		Promise.all([
				lexer1.parse().then(
					(data) => {
						assert.deepEqual(data.tokens, layoutTokens);
						assert.equal(data.tokens.length, 250);
					}
				)
			])
			.then((data) => {
				let t2 = (new Date()).getTime();
				console.log('TIME', +(t2 - t1));
				done();
			})
			.catch((error) => {
				let t2 = (new Date()).getTime();
				console.log('TIME IN ERROR', +(t2 - t1));
				done(error);
			});
	});


	it('Should open and close block', (done) => {
		let template = `<div>
			     {% %}
		</div>`;
		let lexer = new Lexer(template, new LexerOptions());
		lexer.parse().then(
			(data) => {
				assert.deepEqual(data.tokens, [
					{
						columnNumber: 9,
						lineNumber: 2,
						tokenName: 'BLOCK_START',
						type: Tokens.BLOCK_START,
						value: '{%'
					},
					{
						columnNumber: 10,
						lineNumber: 2,
						tokenName: 'WHITESPACE',
						type: Tokens.WHITESPACE,
						value: ' '
					},
					{
						columnNumber: 12,
						lineNumber: 2,
						tokenName: 'BLOCK_END',
						type: Tokens.BLOCK_END,
						value: '%}'
					}
				]);
				done();
			}
		).catch(done);
	});

	it('Should open and close variable', (done) => {
		let template = `<div>{{ value }}</div>`;
		let lexer = new Lexer(template, new LexerOptions());
		lexer.parse().then(
			(data) => {
				assert.deepEqual(data.tokens, [
					{
						columnNumber: 7,
						lineNumber: 1,
						tokenName: 'VARIABLE_START',
						type: Tokens.VARIABLE_START,
						value: '{{'
					},
					{
						columnNumber: 8,
						lineNumber: 1,
						tokenName: 'WHITESPACE',
						type: Tokens.WHITESPACE,
						value: ' '
					},
					{
						columnNumber: 13,
						lineNumber: 1,
						tokenName: 'SYMBOL',
						type: Tokens.SYMBOL,
						value: 'value'
					},
					{
						columnNumber: 14,
						lineNumber: 1,
						tokenName: 'WHITESPACE',
						type: Tokens.WHITESPACE,
						value: ' '
					},
					{
						columnNumber: 16,
						lineNumber: 1,
						tokenName: 'VARIABLE_END',
						type: Tokens.VARIABLE_END,
						value: '}}'
					}
				]);
				done();
			}
		).catch(done);
	});
	
	it('Should open and close comment', (done) => {
		let template = `<div>{# this is some comment {{}} #}</div>`;
		let lexer = new Lexer(template, new LexerOptions());
		lexer.parse().then(
			(data) => {
				assert.deepEqual(data.tokens, [
					{
						columnNumber: 7,
						lineNumber: 1,
						tokenName: 'COMMENT_START',
						type: Tokens.COMMENT_START,
						value: '{#'
					},
					{
						columnNumber: 36,
						lineNumber: 1,
						tokenName: 'COMMENT_END',
						type: Tokens.COMMENT_END,
						value: '#}'
					}
				]);
				done();
			}
		).catch(done);
	});

	it('Should throw InvalidOpenTokenError', (done) => {
		let lexer = new Lexer(`This is an test 
		#} and it should throw error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Invalid open token found at line: 2, 
			column: 3, 
			value: #},
			tokenType: ${Tokens.COMMENT_END}`);
			done();
		}).catch(done);
	});

	it('Should throw TokenNotFoundError', (done) => {
		let lexer = new Lexer(`This is an test 
		{# and it should throw error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Unexpected end of input, 
			Token was opened with token: {# at line 2 column 3,
			expected END token should be found at line: 2, column: 29`);
			done();
		}).catch(done);
	});

	it('Should throw InvalidCloseTokenError', (done) => {
		let lexer = new Lexer(`This is an test 
		{% and it should throw #} error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Invalid close token found at line: 2, 
			column: 26, 
			value: #},
			tokenType: ${Tokens.BLOCK_START}`);
			done();
		}).catch(done);
	});

	it('Should throw InvalidTokenError {%', (done) => {
		let lexer = new Lexer(`This is an test 
		{% {% token %} and it should throw  error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Invalid token found at line: 2, 
			column: 6, 
			value: {%,
			tokenType: ${Tokens.BLOCK_START}`);
			done();
		}).catch(done);
	});

	it('Should throw InvalidTokenError {{', (done) => {
		let lexer = new Lexer(`This is an test 
		{{ {{ token }} and it should throw  error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Invalid token found at line: 2, 
			column: 6, 
			value: {{,
			tokenType: ${Tokens.VARIABLE_START}`);
			done();
		}).catch(done);
	});
});

