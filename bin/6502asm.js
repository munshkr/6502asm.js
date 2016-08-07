#!/usr/bin/env node
const process = require('process');
const DEFAULT_OUT = './a.out';

let program = require('commander');

program
  .usage('[options] <file>')
  .option('-o, --output [file]',
    `output object file (default: ${DEFAULT_OUT})`, DEFAULT_OUT)
  .option('-s, --symbols [file]', 'output symbols table (in JSON)')
  .option('-d, --debug', 'print debugging info')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

if (program.args.length === 0) {
  console.error('Missing source file');
  process.exit(1);
}

if (program.args.length > 1) {
  console.error(`Invalid arguments: ${program.args}`);
  process.exit(1);
}


const fs = require('fs');
const Assembler = require('../lib/assembler.js').Assembler;

function abort(err) {
  if (err.location) {
    let loc = err.location.start;
    console.error(`${err.message}, at ${loc.line}:${loc.column}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}

try {
  let assembler = new Assembler({ debug: program.debug });

  let source = fs.readFileSync(program.args[0]).toString();
  let {objectCode, symbolTable} = assembler.assemble(source, { debug: true });

  let buf = Buffer.from(objectCode);
  fs.writeFileSync(program.output, buf);

  if (program.symbols) {
    fs.writeFileSync(program.symbols, JSON.stringify(symbolTable, null, 4));
  }
} catch (err) {
  abort(err);
}
