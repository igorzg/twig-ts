import {Lexer} from '../lexer';
import {LexerOptions} from '../lexeroptions';
import {Token} from '../token';
import {Tokens} from '../tokens';
import {readFileSync} from 'fs';
import {isEqual} from '../core';
import {InvalidTokenError} from '../error';
import {assert} from 'chai';
import {inspect} from 'util';
let layout = readFileSync(__dirname + '/../../tmpl/layout.twig', 'utf-8');

describe('Lexer', () => {
	it('Should give correct lexical analysis of layout.twig', (done) => {
		let lexer = new Lexer(layout, new LexerOptions());
		lexer.parse().then(
			(data) => {

				console.log('data.tokens', data.tokens);
				assert.equal(data.tokens.length, 55);
				assert.isTrue(isEqual(data.tokens, [
					new Token(
						Tokens.VARIABLE_START,
						'{{', 2, 8
					),
					new Token(
						Tokens.STRING,
						'liked_product_notification', 2, 58
					),
					new Token(
						Tokens.VARIABLE_END,
						'}}', 2, 61
					),
					new Token(
						Tokens.BLOCK_START,
						'{%', 3, 8
					),
					new Token(
						Tokens.STRING,
						'first-time-seen', 3, 34
					),
					new Token(
						Tokens.BLOCK_END,
						'%}', 3, 36
					),
					new Token(
						Tokens.BLOCK_START,
						'{%-', 4, 9
					),
					new Token(
						Tokens.STRING,
						'abc', 4, 23
					),
					new Token(
						Tokens.BLOCK_END,
						'-%}', 4, 26
					),
					new Token(
						Tokens.COMMENT_START,
						'{#', 5, 8
					),
					new Token(
						Tokens.COMMENT_END,
						'#}', 7, 8
					)
				]));
				done();
			}
		).catch(done);
	});


	it('Should open and close tokens correctly', (done) => {
		let template = `<div data-cn-body-wrapper class="cn-body-wrapper">
			    {{ macro.flash_message('liked_product_notification') }}
			    {% widget 'first-time-seen' %}
			    {%- widget 'abc' -%}
			    {# this is an comment {%%} {{   test  }}
			       <div some bullshit></div>
			    #}
		    </div>
    	`;
		let lexer = new Lexer(template, new LexerOptions());
		lexer.parse().then(
			(data) => {
				assert.isTrue(isEqual(data.tokens, [
					new Token(
						Tokens.VARIABLE_START,
						'{{', 2, 8
					),
					new Token(
						Tokens.STRING,
						'liked_product_notification', 2, 58
					),
					new Token(
						Tokens.VARIABLE_END,
						'}}', 2, 61
					),
					new Token(
						Tokens.BLOCK_START,
						'{%', 3, 8
					),
					new Token(
						Tokens.STRING,
						'first-time-seen', 3, 34
					),
					new Token(
						Tokens.BLOCK_END,
						'%}', 3, 36
					),
					new Token(
						Tokens.BLOCK_START,
						'{%-', 4, 9
					),
					new Token(
						Tokens.STRING,
						'abc', 4, 23
					),
					new Token(
						Tokens.BLOCK_END,
						'-%}', 4, 26
					),
					new Token(
						Tokens.COMMENT_START,
						'{#', 5, 8
					),
					new Token(
						Tokens.COMMENT_END,
						'#}', 7, 8
					)
				]));
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
			tokenType: 8`);
			done();
		}).catch(done);
	});

	it('Should throw TokenNotFoundError', (done) => {
		let lexer = new Lexer(`This is an test 
		{# and it should throw error`, new LexerOptions());
		lexer.parse().then(null, (error) => {
			assert.equal(error, `Error: Unexpected end of input, 
			Token was opened with token:   at line 2 column 24,
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
			tokenType: 3`);
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
			tokenType: 3`);
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
			tokenType: 5`);
			done();
		}).catch(done);
	});
});

