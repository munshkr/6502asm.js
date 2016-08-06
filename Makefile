.PHONY: test install-deps parser

all: parser test

install-deps:
	npm install

test:
	npm test

parser: lib/parser.js

lib/parser.js: lib/grammar.peg
	node_modules/.bin/pegjs --cache lib/grammar.peg lib/parser.js
