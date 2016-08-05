# 6502asm.js [![Build Status](https://travis-ci.org/munshkr/6502asm.js.svg?branch=master)](https://travis-ci.org/munshkr/6502asm.js)

A 6502 assembler written in Javascript

*NOTE: This is still in pre-alpha stage.* That means unstable, slow and ugly
code lies ahead.

You're welcome to submit patches or features!

## Dependencies

Uses Ecmascript 6 extensively so you need either Node 6+, or
[Babel](https://babeljs.io/) to transpile to ES5 (especially if you need to run
it on browsers).

## Install

You can install with npm:

```bash
npm install munshkr/6502asm.js
```

If you clone the repo, install all dependency packages with `npm install`.

Then execute `npm test` to run unit tests and verify everything works.

## Usage

```
  Usage: 6502asm [options] <file>

  Options:

    -h, --help           output usage information
    -o, --output [file]  output object file (default: ./a.out)
    -a, --print-ast      print parser's AST
    -s, --print-symbols  print symbols table
```

## Contributing

Bug reports and pull requests are welcome on GitHub at
https://github.com/munshkr/6502asm.js

## License

Source code is released under [Apache 2 license](LICENSE).
