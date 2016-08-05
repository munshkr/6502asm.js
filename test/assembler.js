const fs = require('fs');
const assert = require('assert');
const PEG = require('pegjs');
const path = require('path');

const grammar = fs.readFileSync(path.join(__dirname, '../lib/grammar.peg')).toString();
const parse = PEG.buildParser(grammar).parse;
const assemble = require('../lib/assembler').assemble;

describe('6502 Assembler', () => {
  describe('Labels', () => {
    it('registers a label on the symbol table', () => {
      let prg = parse(`
        foo:
        bar:
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [],
        symbolTable: { foo: 0, bar: 0 }
      });
    });

    it('registers a label on the symbol table (2)', () => {
      let prg = parse(`
        foo: nop
             nop
        bar: nop
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0xea, 0xea, 0xea],
        symbolTable: { foo: 0, bar: 2 }
      });
    });

    it('throws an error when label is already defined', () => {
      let prg = parse(`
        foo: nop
        foo: nop
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('registers a label definition on the symbol table', () => {
      let prg = parse(`
        foo = $8001
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [],
        symbolTable: { foo: 0x8001 }
      });
    });

    it('updates program counter when redefining \'*\' label', () => {
      let prg = parse(`
        * = 0x801
        basic:
        * = 0xc000
        code:
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [],
        symbolTable: { basic: 0x801, code: 0xc000 }
      });
    });

    it('throws an error when label is already defined (w/label def)', () => {
      let prg = parse(`
        foo:
          foo = 1
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('throws an error when label is already defined ' +
       '(w/label def) (2)', () => {

      let prg = parse(`
        foo = 1
        foo = 2
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });
  });

  describe('Directives', () => {
    it('inserts bytes with .byte directive', () => {
      let prg = parse(`
        data:
          .byte 1, 2, 3, 0, 255
        code:
          nop
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [1, 2, 3, 0, 255, 0xea],
        symbolTable: { data: 0, code: 5 }
      });
    });

    it('inserts words with .word directive', () => {
      let prg = parse(`
        data:
          .word $20, 0, $1000, $fffe
        code:
          nop
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0x20, 0, 0, 0, 0, 0x10, 0xfe, 0xff, 0xea],
        symbolTable: { data: 0, code: 8 }
      });
    });

    it('inserts bytes with .aasc directive', () => {
      let prg = parse(`
        data:
          .byte "hola", "chau"
        code:
          nop
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0x68, 0x6f, 0x6c, 0x61,
                     0x63, 0x68, 0x61, 0x75,
                     0xea],
        symbolTable: { data: 0, code: 8 }
      });
    });
  });

  describe('Instructions', () => {
    it('throws an error when using an unknown mnemonic', () => {
      let prg = parse(`
        wat
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('throws an error when using an invalid addressing mode', () => {
      let prg = parse(`
        pla $1000
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('increments PC after instructions of different sizes', () => {
      let prg = parse(`
        a: lda $1000    ; 3 bytes
        b: lda $42, x   ; 2 bytes
        c: nop          ; 1 byte
        d: bne a        ; 2 bytes
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0xad, 0, 0x10,
                     0xb5, 0x42,
                     0xea,
                     0xd0, 0xf8],
        symbolTable: { a: 0, b: 3, c: 5, d: 6 }
      });
    });

    it('throws an error when referring to an undefined label', () => {
      let prg = parse(`
        jmp wtf
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('uses relative addresses to labels on branch instructions', () => {
      let prg = parse(`
        work: rts
        loop: jsr work
              dex
              bne loop
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0x60,
                     0x20, 0, 0,
                     0xca,
                     0xd0, 0xfa],
        symbolTable: { work: 0, loop: 1 }
      });
    });

    it('throws an error when relative addresses is out of range', () => {
      let prg = parse(`
        init: nop
        * = $200
              bne init
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('refers * to PC, the location of current instruction', () => {
      let prg = parse(`
              nop
              nop
        loop: jmp *
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0xea, 0xea, 0x4c, 2, 0],
        symbolTable: { loop: 2 }
      });
    });

    it('negative values are stored in two\'s complement', () => {
      let prg = parse(`
        foo = -1
        bar = -25
        lda #foo
        lda #bar
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0xa9, 0xff,
                     0xa9, 0xe7],
        symbolTable: { foo: -1, bar: -25 }
      });
    });

    it('throws an error if instruction in Immediate mode has a label ' +
       'operand that refers to a 16-bit number', () => {

      let prg = parse(`
        foo = $200
        adc #foo
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('throws an error if instruction in Indirect X-Indexed mode has ' +
       'a label operand that refers to a 16-bit number', () => {

      let prg = parse(`
        init = $200
        adc (init, x)
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });

    it('throws an error if instruction in Indirect Y-Indexed mode has ' +
       'a label operand that refers to a 16-bit number', () => {

      let prg = parse(`
        foo = $200
        adc (foo), y
      `);

      assert.throws(() => { assemble(prg); }, Error);
    });
  });

  describe('Expressions', () => {
    it('with < or > evaluate to LSB/MSB of term', () => {
      let prg = parse(`
        loadAddr = $1040
        lda <loadAddr
        lda >loadAddr
      `);

      assert.deepEqual(assemble(prg), {
        objectCode: [0xa5, 0x40,
                     0xa5, 0x10],
        symbolTable: { loadAddr: 0x1040 }
      });
    });

    it('can use "-" unary operator', () => {
      let prg = parse(`foo = -1337`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: -1337 }
      });
    });

    it('can use "~" unary operator', () => {
      let prg = parse(`foo = ~0b11001100`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: -205 }
      });
    });

    it('can use "!" unary operator', () => {
      let prg = parse(`isTrue = !0
                       isFalse = !21`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });
    it('can use "+" binary operator', () => {
      let prg = parse(`foo = 10 + 0x100`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 0x10a }
      });
    });

    it('can use "-" binary operator', () => {
      let prg = parse(`* = $100
                       foo = $200 - *`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 0x100 }
      });
    });

    it('can use "*" binary operator', () => {
      let prg = parse(`foo = 32 * 2`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 64 }
      });
    });

    it('can use "/" binary operator', () => {
      let prg = parse(`foo = 100 / 2`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 50 }
      });
    });

    it('can use ">>" binary operator', () => {
      let prg = parse(`foo = 64 >> 3`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 8 }
      });
    });

    it('can use "<<" binary operator', () => {
      let prg = parse(`foo = 2 << 4`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 32 }
      });
    });

    it('can use "<=", ">=" binary operators', () => {
      let prg = parse(`isTrue  = 4 <= 4
                       isFalse = 1 >= 2`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });

    it('can use "<", ">" binary operators', () => {
      let prg = parse(`isTrue  = 2 < 4
                       isFalse = 10 > 15`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });

    it('can use "==", "!=" binary operators', () => {
      let prg = parse(`isTrue  = (42 == 42)
                       isFalse = (2+2 == 5)`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });

    it('can use "&" binary operators', () => {
      let prg = parse(`foo = $1234
                       bar = foo & $ff`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 0x1234, bar: 0x34 }
      });
    });

    it('can use "^" binary operators', () => {
      let prg = parse(`foo = 1 ^ $ff`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 0xfe }
      });
    });

    it('can use "|" binary operators', () => {
      let prg = parse(`foo = 1 | 4 | 8`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { foo: 13 }
      });
    });

    it('can use "&&" binary operators', () => {
      let prg = parse(`isTrue = 42 && 1
                       isFalse = 0 && 1`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });

    it('can use "||" binary operators', () => {
      let prg = parse(`isTrue = 0 || 1
                       isFalse = 0 || 0`);

      assert.deepEqual(assemble(prg), {
        objectCode: [], symbolTable: { isTrue: 1, isFalse: 0 }
      });
    });
  });

  it('throws an error if using .byte with a label that refers to a 16-bit ' +
     'number', () => {

    let prg = parse(`
      foo = $200
      .byte foo
    `);

    assert.throws(() => { assemble(prg); }, Error);
  });

  it('throws an error if a .byte datum refers to an unresolved symbol', () => {
    let prg = parse(`
      .byte foo
      foo = $200
    `);

    assert.throws(() => { assemble(prg); }, Error);
  });

  it('throws an error if a label refers to an unresolved symbol', () => {
    let prg = parse(`
      bar = foo + 0x10
      foo = $200
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [],
      symbolTable: { bar: 0x210, foo: 0x200 }
    });
  });

  it('optimizes and uses zero-page addressing mode if possible', () => {
    let prg = parse(`
      lda $1000
      lda $10

      lda $1000, x
      lda $10, x
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [0xad, 0, 0x10,
                   0xa5, 0x10,
                   0xbd, 0, 0x10,
                   0xb5, 0x10],
      symbolTable: {}
    });
  });

  it('optimizes and uses zero-page addressing mode if possible ' +
     '(labels)', () => {

    let prg = parse(`
      a = $fe
      tmp = a
      lda tmp
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [0xa5, 0xfe],
      symbolTable: { a: 0xfe, tmp: 0xfe }
    });
  });

  it('compiles instructions with unresolved references as operands', () => {
    let prg = parse(`
      start:
        jsr play
        rts

      play:
        rts
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [0x20, 0x4, 0,
                   0x60,
                   0x60],
      symbolTable: { start: 0, play: 4 }
    });
  });

  it('fails to optimize with zero-page mode if operand has an ' +
     'unresolved symbol', () => {

    let prg = parse(`
      lda hmm
      hmm = $fe
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [0xad, 0xfe, 0],
      symbolTable: { hmm: 0xfe }
    });
  });

  it('resolved chain of label dependences with multiple passes', () => {
    let prg = parse(`
      * = a
      * = b
        a = *
      * = c
        b = *
      c = $1000
    `);

    assert.deepEqual(assemble(prg), {
      objectCode: [],
      symbolTable: { a: 0x1000, b: 0x1000, c: 0x1000 }
    });
  });

  // TODO: test each opcode: allowed addressing modes
});
