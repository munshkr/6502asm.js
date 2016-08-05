#!/usr/bin/env node
const process = require('process');
const DEFAULT_OUT = './a.out';

let program = require('commander');

program
  .usage('[options] <file>')
  .option('-o, --output [file]',
    `output object file (default: ${DEFAULT_OUT})`, DEFAULT_OUT)
  .option('-a, --print-ast', 'print parser\'s AST')
  .option('-s, --print-symbols', 'print symbols table')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

if (program.args.length === 0) {
  console.error(`Missing source file`)
  process.exit(1);
}

if (program.args.length > 1) {
  console.error(`Invalid arguments: ${program.args}`)
  process.exit(1);
}

const PEG = require('pegjs');
const fs = require('fs');
const path = require('path');
const assemble = require('../lib/assembler.js').assemble;

function abort(err) {
  if (err.location) {
    let loc = err.location.start;
    console.error(`${err.message}, at ${loc.line}:${loc.column}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}

function generateParser(grammarPath, options) {
  const grammar = fs.readFileSync(grammarPath).toString();
  return PEG.buildParser(grammar, options);
}

function parse(sourcePath, options) {
  let parser = generateParser(path.join(__dirname, '../lib/grammar.peg'));

  const source = fs.readFileSync(sourcePath).toString();
  const ast = parser.parse(source);

  if (options.printAst) {
    console.log("=== AST ===");
    console.dir(ast, {colors: true, depth: null});
  }

  return ast;
}

function assembleAST(ast, outputPath, options) {
  const out = assemble(ast, { debug: true });
  const buf = Buffer.from(out.objectCode);

  fs.writeFileSync(outputPath, buf);

  if (options.printSymbols) {
    console.log("=== Symbol table ===");
    for (let symbol in out.symbolTable) {
      console.log(`$${out.symbolTable[symbol].toString(16, 4)}: ${symbol}`);
    }
  }
}


const inputPath = program.args[0];
const outputPath = program.output;

try {
  let ast = parse(inputPath, { printAst: program.printAst });
  assembleAST(ast, outputPath, { printSymbols: program.printSymbols });
} catch (err) {
  abort(err);
}
