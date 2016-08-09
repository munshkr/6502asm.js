const assert = require('assert');

const parse = require('../lib/parser').parse;

// Build a Program AST with one line with +statements+
function buildProgram(statements) {
  if (typeof(statements) === 'undefined') {
    statements = [];
  }
  return {
    type: 'program',
    body: statements.map(v => {
      if (typeof(v.line) === 'undefined') {
        v.line = 1;
      }
      return v;
    })
  };
}

describe('6502 Parser', () => {
  describe('SingleLineComment', () => {
    it('starts with ; or // after a statement', () => {
      const prg = buildProgram([
        { type: 'inst', name: 'nop', operand: null }
      ]);

      assert.deepEqual(parse('nop  ; this is a comment'), prg);
      assert.deepEqual(parse('nop  // this is a comment'), prg);
    });

    it('starts with ; or //', () => {
      const prg = buildProgram();

      assert.deepEqual(parse(' ; this is a comment'), prg);
      assert.deepEqual(parse('// this is a comment'), prg);
    });
  });

  describe('MultiLineComment', () => {
    it('starts with /* and ends with */', () => {
      const prg = buildProgram();
      assert.deepEqual(parse('  /* this is a comment */'), prg);
    });

    it('can span multiple lines', () => {
      const prg = buildProgram();
      assert.deepEqual(parse(`  /* this is a comment
                                   that spans two lines */`), prg);
    });

    it('can span multiple lines after a statement', () => {
      const prg = buildProgram([
        { type: 'inst', name: 'nop', operand: null }
      ]);

      assert.deepEqual(parse(`nop /* this is a comment
                                     that spans two lines */`), prg);
    });

    it('can comment out multiple statements', () => {
      const prg = buildProgram([]);

      assert.deepEqual(parse(`/* not parsed
                                jmp *
                              */`), prg);
    });
  });

  describe('NumLiteral', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'lda',
        operand: {
          type: 'op',
          mode: 'abs',
          expr: {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: {
                type: 'number',
                value: value
              }
            }
          }
        }
      }]);
    };

    it('is a decimal number', () => {
      assert.deepEqual(parse('lda 1337'), prg(1337));
    });

    it('is a binary number with prefix %', () => {
      assert.deepEqual(parse('lda %1011'), prg(11));
    });

    it('is a binary number with prefix 0b', () => {
      assert.deepEqual(parse('lda 0b1011'), prg(11));
    });

    it('is an hexadecimal number with prefix $', () => {
      assert.deepEqual(parse('lda $dc00'), prg(0xdc00));
    });

    it('is an hexadecimal number with prefix 0x', () => {
      assert.deepEqual(parse('lda 0xdc00'), prg(0xdc00));
    });

    it('is not bigger than an 16-bit number', () => {
      assert.throws(() => parse('lda $11042'), Error);
    });
  });

  describe('UnaryExpression', () => {
    const prg = (expr) => {
      return buildProgram([{
        type: 'inst',
        name: 'lda',
        operand: {
          type: 'op',
          mode: 'abs',
          expr: expr
        }
      }]);
    };

    it('can have a prefix operator "<" in operands', () => {
      assert.deepEqual(parse('lda <addr'), prg({
        type: 'unary',
        operator: '<',
        argument: {
          type: 'term',
          value: {
            type: 'label',
            value: 'addr'
          }
        }
      }));
    });

    it('can have a prefix operator ">" in operands', () => {
      assert.deepEqual(parse('lda >addr'), prg({
        type: 'unary',
        operator: '>',
        argument: {
          type: 'term',
          value: {
            type: 'label',
            value: 'addr'
          }
        }
      }));
    });

    it('can have a prefix operator ">" or "<" in directives', () => {
      const prg = buildProgram([{
        type: 'directive',
        name: 'byte',
        exprs: [{
          type: 'unary',
          operator: '>',
          argument: {
            type: 'term',
            value: {
              type: 'label',
              value: 'load_addr',
            }
          }
        }, {
          type: 'unary',
          operator: '<',
          argument: {
            type: 'term',
            value: {
              type: 'label',
              value: 'load_addr',
            }
          }
        }]
      }]);

      assert.deepEqual(parse('.byte >load_addr, <load_addr'), prg);
    });
  });

  describe('MultiplicativeExpression', () => {
    const prg = (expr) => {
      return buildProgram([{
        type: 'label_def',
        name: 'foo',
        expr: expr
      }]);
    };

    it('is a binary expresison of *', () => {
      assert.deepEqual(parse('foo = 2*4'), prg({
        type: 'binary',
        operator: '*',
        left: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 2 }
          }
        },
        right: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 4 }
          }
        },
      }));
    });

    it('is a binary expresison of /', () => {
      assert.deepEqual(parse('foo = 1000/25'), prg({
        type: 'binary',
        operator: '/',
        left: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 1000 }
          }
        },
        right: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 25 }
          }
        },
      }));
    });
  });

  describe('Label', () => {
    const prg = (name) => {
      return buildProgram([{
        type: 'label',
        name: name
      }]);
    };

    it('has an alphanumeric name or \'_\'', () => {
      assert.deepEqual(parse('foo_42:  '), prg('foo_42'));
    });

    it('doesn\'t start with a number', () => {
      assert.throws(() => parse('1no:'), Error);
    });
  });

  describe('LabelDefinition', () => {
    const prg = (name, value) => {
      return buildProgram([{
        type: 'label_def',
        name: name,
        expr: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: value
          }
        }
      }]);
    };

    it('assigns a number to a label with =', () => {
      assert.deepEqual(parse('my_var = $2000'),
        prg('my_var', { type: 'number', value: 0x2000 }));
    });

    it('assigns program counter a different address', () => {
      assert.deepEqual(parse('* = $8000'),
        prg('*', { type: 'number', value: 0x8000 }));
    });

    it('assigns another label as value', () => {
      assert.deepEqual(parse('bar = foo'),
        prg('bar', { type: 'label', value: 'foo' }));
    });
  });

  describe('SetByte', () => {
    const prg = (values) => {
      return buildProgram([{
        type: 'directive',
        name: 'byte',
        exprs: values.map((value) => {
          return {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: value
            }
          };
        })
      }]);
    };

    it('inserts a single byte at current location', () => {
      assert.deepEqual(parse('.byte 0xff'),
        prg([{ type: 'number', value: 0xff }]));
    });

    it('inserts multiple bytes at current location', () => {
      assert.deepEqual(parse('.byte $10,$43'),
        prg([
          { type: 'number', value: 0x10 },
          { type: 'number', value: 0x43 }
        ]));
    });

    it('inserts a single character at current location', () => {
      assert.deepEqual(parse('.byte \'h\''),
        prg([{ type: 'string', value: 'h' }]));
      assert.deepEqual(parse('.byte "h"'),
        prg([{ type: 'string', value: 'h' }]));
    });

    it('inserts a single string at current location', () => {
      assert.deepEqual(parse('.byte \'hola\''),
        prg([{ type: 'string', value: 'hola' }]));
      assert.deepEqual(parse('.byte "hola"'),
        prg([{ type: 'string', value: 'hola' }]));
    });

    it('inserts multiple words at current location', () => {
      assert.deepEqual(parse('.byte "hola", \'que\', "tal?"'),
        prg([
          { type: 'string', value: 'hola' },
          { type: 'string', value: 'que' },
          { type: 'string', value: 'tal?' },
        ]));
    });

    it('inserts current PC at current location', () => {
      assert.deepEqual(parse('.byte 1, *, 3'),
        prg([
          { type: 'number', value: 1 },
          { type: 'label', value: '*' },
          { type: 'number', value: 3 },
        ]));
    });

    it('inserts a label at current location', () => {
      assert.deepEqual(parse('.byte 1, foo, 3'),
        prg([
          { type: 'number', value: 1 },
          { type: 'label', value: 'foo' },
          { type: 'number', value: 3 },
        ]));
    });
  });

  describe('SetWord', () => {
    const prg = (values) => {
      return buildProgram([{
        type: 'directive',
        name: 'word',
        exprs: values.map((value) => {
          return {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: value
            }
          };
        })
      }]);
    };

    it('inserts a single word at current location', () => {
      assert.deepEqual(parse('.word 0'),
        prg([{ type: 'number', value: 0 }]));
    });

    it('inserts multiple words at current location', () => {
      assert.deepEqual(parse('.word 10, $400, 0xff00'),
        prg([
          { type: 'number', value: 10 },
          { type: 'number', value: 0x400 },
          { type: 'number', value: 0xff00 }
        ]));
    });

    it('inserts current PC at current location', () => {
      assert.deepEqual(parse('.word $10, *, $2000'),
        prg([
          { type: 'number', value: 0x10 },
          { type: 'label', value: '*' },
          { type: 'number', value: 0x2000 }
        ]));
    });

    it('inserts a label at current location', () => {
      assert.deepEqual(parse('.word $1000, baz, $ff'),
        prg([
          { type: 'number', value: 0x1000 },
          { type: 'label', value: 'baz' },
          { type: 'number', value: 0xff }
        ]));
    });
  });

  describe('SetAscii', () => {
    const prg = (values) => {
      return buildProgram([{
        type: 'directive',
        name: 'byte',
        exprs: values.map((value) => {
          return {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: value
            }
          };
        })
      }]);
    };

    it('inserts a single character at current location', () => {
      assert.deepEqual(parse('.aasc \'h\''),
        prg([{ type: 'string', value: 'h' }]));

      assert.deepEqual(parse('.aasc "h"'),
        prg([{ type: 'string', value: 'h' }]));
    });

    it('inserts a single string at current location', () => {
      assert.deepEqual(parse('.aasc \'hola\''),
        prg([{ type: 'string', value: 'hola' }]));

      assert.deepEqual(parse('.aasc "hola"'),
        prg([{ type: 'string', value: 'hola' }]));
    });

    it('inserts multiple words at current location', () => {
      assert.deepEqual(parse('.aasc "hola", \'que\', "tal?"'),
        prg([
          { type: 'string', value: 'hola' },
          { type: 'string', value: 'que' },
          { type: 'string', value: 'tal?' }
        ]));
    });

    it('inserts current PC at current location', () => {
      assert.deepEqual(parse('.aasc "a", *, "zzz"'),
        prg([
          { type: 'string', value: 'a' },
          { type: 'label', value: '*' },
          { type: 'string', value: 'zzz' },
        ]));
    });

    it('inserts a label at current location', () => {
      assert.deepEqual(parse('.aasc "a", baz, "b"'),
        prg([
          { type: 'string', value: 'a' },
          { type: 'label',  value: 'baz' },
          { type: 'string', value: 'b' }
        ]));
    });
  });

  describe('Reserve', () => {
    const prg = (length, fillByte) => {
      return buildProgram([{
        type: 'directive',
        name: 'res',
        len: length,
        fillByte: fillByte
      }]);
    };

    it('reserves storage by filling bytes with 0', () => {
      assert.deepEqual(parse('.res 32'),
        prg({
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: {
              type: 'number',
              value: 32
            }
          }
        }, null));
    });

    it('reserves storage with a different filling byte', () => {
      assert.deepEqual(parse('.res 8, $ff'),
        prg({
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: {
              type: 'number',
              value: 8
            }
          }
        }, {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: {
              type: 'number',
              value: 255
            },
          }
        }));
    });

    it('reserves storage based on current LC', () => {
      assert.deepEqual(parse('.res $1000-*'),
        prg({
          type: 'binary',
          left: {
            argument: {
              type: 'term',
              value: {
                type: 'number',
                value: 4096
              }
            },
            operator: null,
            type: 'unary'
          },
          operator: '-',
          right: {
            argument: {
              type: 'term',
              value: {
                type: 'label',
                value: '*',
              }
            },
            operator: null,
            type: 'unary'
          }
        }, null));
    });
  });

  describe('Instruction', () => {
    const prg = (name, operand) => {
      return buildProgram([{
        type: 'inst',
        name: name,
        operand: operand
      }]);
    };

    it('can be an implied instruction', () => {
      assert.deepEqual(parse('rts'), prg('rts'));
    });

    it('can be an instruction with an operand', () => {
      assert.deepEqual(parse('jmp $fffe '),
        prg('jmp', {
          type: 'op',
          mode: 'abs',
          expr: {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: { type: 'number', value: 0xfffe }
            }
          }
        }));
    });
  });

  describe('Implied (or with Accumulator) instructions', () => {
    it('parses ASL is immplied (uses accum)', () => {
      const prg = buildProgram([{
        type: 'inst',
        name: 'asl',
        operand: null
      }]);

      assert.deepEqual(parse('asl'), prg);
    });

    it('parses BRK as immplied instruction', () => {
      const prg = buildProgram([{
        type: 'inst',
        name: 'brk',
        operand: null
      }]);

      assert.deepEqual(parse('brk'), prg);
    });
  });

  describe('AbsoluteOp (relative mode)', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'bne',
        operand: {
          type: 'op',
          mode: 'abs',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be an 8-bit number', () => {
      assert.deepEqual(parse('bne $32'),
        prg({ type: 'number', value: 0x32 }));
    });

    it('can be a label', () => {
      assert.deepEqual(parse('bne loop'),
        prg({ type: 'label', value: 'loop' }));
    });

    it('can be a PC', () => {
      assert.deepEqual(parse('bne *'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('ImmediateOp', () => {
    const prg = (value, operator) => {
      return buildProgram([{
        type: 'inst',
        name: 'lda',
        operand: {
          type: 'op',
          mode: 'imm',
          expr: {
            type: 'unary',
            operator: operator,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be an 8-bit number prefixed with #', () => {
      assert.deepEqual(parse('lda #$32'),
        prg({ type: 'number', value: 0x32 }));
    });

    it('can be a negative 8-bit number prefixed with #', () => {
      assert.deepEqual(parse('lda #-1'),
        prg({ type: 'number', value: 1 }, '-'));
    });

    it('can be a label', () => {
      assert.deepEqual(parse('lda #MAX'),
        prg({ type: 'label', value: 'MAX' }));
    });

    it('can be a PC', () => {
      assert.deepEqual(parse('lda #*'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('AbsoluteOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'jmp',
        operand: {
          type: 'op',
          mode: 'abs',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be a number literal', () => {
      assert.deepEqual(parse('jmp $c0'),
        prg({ type: 'number', value: '0xc0' }));
      assert.deepEqual(parse('jmp $1800'),
        prg({ type: 'number', value: '0x1800' }));
    });

    it('can be a label', () => {
      assert.deepEqual(parse('jmp init'),
        prg({ type: 'label', value: 'init' }));
    });

    it('can be PC', () => {
      assert.deepEqual(parse('jmp *'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('AbsoluteXOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'inc',
        operand: {
          type: 'op',
          mode: 'abx',
          expr: {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: value
            }
          }
        }
      }]);
    };

    it('can be a number literal followed by ", x"', () => {
      assert.deepEqual(parse('inc $c1, x'),
        prg({ type: 'number', value: '0xc1' }));
      assert.deepEqual(parse('inc $1800, x'),
        prg({ type: 'number', value: '0x1800' }));
    });

    it('can be a label followed by ", x"', () => {
      assert.deepEqual(parse('inc sprites_color, x'),
        prg({ type: 'label', value: 'sprites_color' }));
    });

    it('can be PC followed by ", x"', () => {
      assert.deepEqual(parse('inc *, x'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('AbsoluteYOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'and',
        operand: {
          type: 'op',
          mode: 'aby',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be a number literal followed by ", y"', () => {
      assert.deepEqual(parse('and $c2, y'),
        prg({ type: 'number', value: '0xc2' }));
      assert.deepEqual(parse('and $1800, y'),
        prg({ type: 'number', value: '0x1800' }));
    });

    it('can be a label followed by ", y"', () => {
      assert.deepEqual(parse('and sprites_color, y'),
        prg({ type: 'label', value: 'sprites_color' }));
    });

    it('can be PC followed by ", y"', () => {
      assert.deepEqual(parse('and *, y'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('IndirectOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'jmp',
        operand: {
          type: 'op',
          mode: 'ind',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be a number literal surrounded by parens', () => {
      assert.deepEqual(parse('jmp ($1000)'),
        prg({ type: 'number', value: 0x1000 }));
    });

    it('can be a label surrounded by parens', () => {
      assert.deepEqual(parse('jmp ( vec )'),
        prg({ type: 'label', value: 'vec' }));
    });

    it('can be PC surrounded by parens', () => {
      assert.deepEqual(parse('jmp (*)'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('IndirectXOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'cmp',
        operand: {
          type: 'op',
          mode: 'izx',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be a number followed by ", x", surrounded by parens', () => {
      assert.deepEqual(parse('cmp ($30, x)'),
        prg({ type: 'number', value: 0x30 }));
    });

    it('can be a label followed by ", x", surrounded by parens', () => {
      assert.deepEqual(parse('cmp (vec, x)'),
        prg({ type: 'label', value: 'vec' }));
    });

    it('can be PC followed by ", x", surrounded by parens', () => {
      assert.deepEqual(parse('cmp (*, x)'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('IndirectYOp', () => {
    const prg = (value) => {
      return buildProgram([{
        type: 'inst',
        name: 'cmp',
        operand: {
          type: 'op',
          mode: 'izy',
          expr: {
            type: 'unary',
            operator: null,
            argument: { type: 'term', value: value }
          }
        }
      }]);
    };

    it('can be a number surrounded by parens, followed by ", y"', () => {
      assert.deepEqual(parse('cmp ($20), y'),
        prg({ type: 'number', value: 0x20 }));
    });

    it('can be a label surrounded by parens, followed by ", y"', () => {
      assert.deepEqual(parse('cmp (vec), y'),
        prg({ type: 'label', value: 'vec' }));
    });

    it('can be PC surrounded by parens, followed by ", y"', () => {
      assert.deepEqual(parse('cmp (*), y'),
        prg({ type: 'label', value: '*' }));
    });
  });

  describe('Line', () => {
    it('can be a label definition', () => {
      const prg = buildProgram([{
        type: 'label_def',
        name: 'foo',
        expr: {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 42 }
          }
        }
      }]);

      assert.deepEqual(parse(' foo = 42  '), prg);
      assert.deepEqual(parse(' foo = 42  ; comment '), prg);
    });

    it('can be a .byte directive', () => {
      const prg = buildProgram([{
        type: 'directive',
        name: 'byte',
        exprs: [{
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 0x10 }
          }
        }, {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 0x43 }
          }
        }]
      }]);

      assert.deepEqual(parse('.byte  $10,$43  '), prg);
      assert.deepEqual(parse(' .byte $10, $43  ; comment '), prg);
    });

    it('can be a .word directive', () => {
      const prg = buildProgram([{
        type: 'directive',
        name: 'word',
        exprs: [{
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 10 }
          }
        }, {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 0x400 }
          }
        }, {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'number', value: 0xff00 }
          }
        }]
      }]);

      assert.deepEqual(parse('.word  10,$400, 0xff00  '), prg);
      assert.deepEqual(parse(' .word 10, $400, $ff00  ; comment '), prg);
    });

    it('can be a .aasc directive', () => {
      const prg = buildProgram([{
        type: 'directive',
        name: 'byte',
        exprs: [{
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'string', value: 'abc' }
          }
        }, {
          type: 'unary',
          operator: null,
          argument: {
            type: 'term',
            value: { type: 'string', value: 'def' }
          }
        }]
      }]);

      assert.deepEqual(parse('.aasc  "abc", "def"  '), prg);
      assert.deepEqual(parse(' .aasc "abc", "def"  ; comment '), prg);
    });

    it('can have a label', () => {
      const prg = buildProgram([{
        type: 'label',
        name: 'my_label'
      }]);

      assert.deepEqual(parse('my_label:  '), prg);
      assert.deepEqual(parse('my_label:  ; <- my label '), prg);
    });

    it('can have an instruction', () => {
      const prg = buildProgram([{
        type: 'inst',
        name: 'ldx',
        operand: {
          type: 'op',
          mode: 'aby',
          expr: {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: { type: 'label', value: 'colors' }
            }
          }
        }
      }]);

      assert.deepEqual(parse(' ldx colors, y  ;yeah '), prg);
    });

    it('can have a label and an instruction', () => {
      const prg = buildProgram([{
        type: 'label',
        name: 'my_label'
      }, {
        type: 'inst',
        name: 'jsr',
        operand: {
          type: 'op',
          mode: 'abs',
          expr: {
            type: 'unary',
            operator: null,
            argument: {
              type: 'term',
              value: { type: 'label', value: 'do_thing' }
            }
          }
        }
      }]);

      assert.deepEqual(parse('my_label:  jsr do_thing  ; oops: what;'), prg);
    });

  });

  describe('Program', () => {
    it('is a sequence of Lines', () => {
      assert.deepEqual(
        parse(`
                    loop: lda $ff
                          adc #1        ; increment
                          sta $fe
                          bne loop      ; loop if not 0
                          brk           ; break apart
                          jmp *
          `),
        {
          type: 'program',
          body: [{
            type: 'label',
            name: 'loop',
            line: 2
          }, {
            type: 'inst',
            name: 'lda',
            operand: {
              type: 'op',
              mode: 'abs',
              expr: {
                type: 'unary',
                operator: null,
                argument: {
                  type: 'term',
                  value: { type: 'number', value: 0xff }
                }
              }
            },
            line: 2
          }, {
            type: 'inst',
            name: 'adc',
            operand: {
              type: 'op',
              mode: 'imm',
              expr: {
                type: 'unary',
                operator: null,
                argument: {
                  type: 'term',
                  value: { type: 'number', value: 1 }
                }
              }
            },
            line: 3
          }, {
            type: 'inst',
            name: 'sta',
            operand: {
              type: 'op',
              mode: 'abs',
              expr: {
                type: 'unary',
                operator: null,
                argument: {
                  type: 'term',
                  value: { type: 'number', value: 0xfe }
                }
              }
            },
            line: 4
          }, {
            type: 'inst',
            name: 'bne',
            operand: {
              type: 'op',
              mode: 'abs',
              expr: {
                type: 'unary',
                operator: null,
                argument: {
                  type: 'term',
                  value: { type: 'label', value: 'loop' }
                }
              }
            },
            line: 5
          }, {
            type: 'inst',
            name: 'brk',
            operand: null,
            line: 6
          }, {
            type: 'inst',
            name: 'jmp',
            operand: {
              type: 'op',
              mode: 'abs',
              expr: {
                type: 'unary',
                operator: null,
                argument: {
                  type: 'term',
                  value: { type: 'label', value: '*' }
                }
              }
            },
            line: 7
          }]
        });
    });
  });
});
