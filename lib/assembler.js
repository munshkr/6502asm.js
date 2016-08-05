'use strict';

const mnemonics = {
  'adc abs' : { code: 0x6d, size: 3 },
  'adc abx' : { code: 0x7d, size: 3 },
  'adc aby' : { code: 0x79, size: 3 },
  'adc imm' : { code: 0x69, size: 2 },
  'adc izx' : { code: 0x61, size: 2 },
  'adc izy' : { code: 0x71, size: 2 },
  'adc zp'  : { code: 0x65, size: 2 },
  'adc zpx' : { code: 0x75, size: 2 },
  'ahx aby' : { code: 0x9f, size: 3 },
  'ahx izy' : { code: 0x93, size: 2 },
  'alr imm' : { code: 0x4b, size: 2 },
  'anc imm' : { code: 0x2b, size: 2 },
  'and abs' : { code: 0x2d, size: 3 },
  'and abx' : { code: 0x3d, size: 3 },
  'and aby' : { code: 0x39, size: 3 },
  'and imm' : { code: 0x29, size: 2 },
  'and izx' : { code: 0x21, size: 2 },
  'and izy' : { code: 0x31, size: 2 },
  'and zp'  : { code: 0x25, size: 2 },
  'and zpx' : { code: 0x35, size: 2 },
  'arr imm' : { code: 0x6b, size: 2 },
  'asl abs' : { code: 0x0e, size: 3 },
  'asl abx' : { code: 0x1e, size: 3 },
  'asl'     : { code: 0x0a, size: 1 },
  'asl zp'  : { code: 0x06, size: 2 },
  'asl zpx' : { code: 0x16, size: 2 },
  'axs imm' : { code: 0xcb, size: 2 },
  'bcc rel' : { code: 0x90, size: 2 },
  'bcs rel' : { code: 0xb0, size: 2 },
  'beq rel' : { code: 0xf0, size: 2 },
  'bit abs' : { code: 0x2c, size: 3 },
  'bit zp'  : { code: 0x24, size: 2 },
  'bmi rel' : { code: 0x30, size: 2 },
  'bne rel' : { code: 0xd0, size: 2 },
  'bpl rel' : { code: 0x10, size: 2 },
  'brk'     : { code: 0x00, size: 1 },
  'bvc rel' : { code: 0x50, size: 2 },
  'bvs rel' : { code: 0x70, size: 2 },
  'clc'     : { code: 0x18, size: 1 },
  'cld'     : { code: 0xd8, size: 1 },
  'cli'     : { code: 0x58, size: 1 },
  'clv'     : { code: 0xb8, size: 1 },
  'cmp abs' : { code: 0xcd, size: 3 },
  'cmp abx' : { code: 0xdd, size: 3 },
  'cmp aby' : { code: 0xd9, size: 3 },
  'cmp imm' : { code: 0xc9, size: 2 },
  'cmp izx' : { code: 0xc1, size: 2 },
  'cmp izy' : { code: 0xd1, size: 2 },
  'cmp zp'  : { code: 0xc5, size: 2 },
  'cmp zpx' : { code: 0xd5, size: 2 },
  'cpx abs' : { code: 0xec, size: 3 },
  'cpx imm' : { code: 0xe0, size: 2 },
  'cpx zp'  : { code: 0xe4, size: 2 },
  'cpy abs' : { code: 0xcc, size: 3 },
  'cpy imm' : { code: 0xc0, size: 2 },
  'cpy zp'  : { code: 0xc4, size: 2 },
  'dcp abs' : { code: 0xcf, size: 3 },
  'dcp abx' : { code: 0xdf, size: 3 },
  'dcp aby' : { code: 0xdb, size: 3 },
  'dcp izx' : { code: 0xc3, size: 2 },
  'dcp izy' : { code: 0xd3, size: 2 },
  'dcp zp'  : { code: 0xc7, size: 2 },
  'dcp zpx' : { code: 0xd7, size: 2 },
  'dec abs' : { code: 0xce, size: 3 },
  'dec abx' : { code: 0xde, size: 3 },
  'dec zp'  : { code: 0xc6, size: 2 },
  'dec zpx' : { code: 0xd6, size: 2 },
  'dex'     : { code: 0xca, size: 1 },
  'dey'     : { code: 0x88, size: 1 },
  'eor abs' : { code: 0x4d, size: 3 },
  'eor abx' : { code: 0x5d, size: 3 },
  'eor aby' : { code: 0x59, size: 3 },
  'eor imm' : { code: 0x49, size: 2 },
  'eor izx' : { code: 0x41, size: 2 },
  'eor izy' : { code: 0x51, size: 2 },
  'eor zp'  : { code: 0x45, size: 2 },
  'eor zpx' : { code: 0x55, size: 2 },
  'inc abs' : { code: 0xee, size: 3 },
  'inc abx' : { code: 0xfe, size: 3 },
  'inc zp'  : { code: 0xe6, size: 2 },
  'inc zpx' : { code: 0xf6, size: 2 },
  'inx'     : { code: 0xe8, size: 1 },
  'iny'     : { code: 0xc8, size: 1 },
  'isc abs' : { code: 0xef, size: 3 },
  'isc abx' : { code: 0xff, size: 3 },
  'isc aby' : { code: 0xfb, size: 3 },
  'isc izx' : { code: 0xe3, size: 2 },
  'isc izy' : { code: 0xf3, size: 2 },
  'isc zp'  : { code: 0xe7, size: 2 },
  'isc zpx' : { code: 0xf7, size: 2 },
  'jmp abs' : { code: 0x4c, size: 3 },
  'jmp ind' : { code: 0x6c, size: 3 },
  'jsr abs' : { code: 0x20, size: 3 },
  'las aby' : { code: 0xbb, size: 3 },
  'lax abs' : { code: 0xaf, size: 3 },
  'lax aby' : { code: 0xbf, size: 3 },
  'lax imm' : { code: 0xab, size: 2 },
  'lax izx' : { code: 0xa3, size: 2 },
  'lax izy' : { code: 0xb3, size: 2 },
  'lax zp'  : { code: 0xa7, size: 2 },
  'lax zpy' : { code: 0xb7, size: 2 },
  'lda abs' : { code: 0xad, size: 3 },
  'lda abx' : { code: 0xbd, size: 3 },
  'lda aby' : { code: 0xb9, size: 3 },
  'lda imm' : { code: 0xa9, size: 2 },
  'lda izx' : { code: 0xa1, size: 2 },
  'lda izy' : { code: 0xb1, size: 2 },
  'lda zp'  : { code: 0xa5, size: 2 },
  'lda zpx' : { code: 0xb5, size: 2 },
  'ldx abs' : { code: 0xae, size: 3 },
  'ldx aby' : { code: 0xbe, size: 3 },
  'ldx imm' : { code: 0xa2, size: 2 },
  'ldx zp'  : { code: 0xa6, size: 2 },
  'ldx zpy' : { code: 0xb6, size: 2 },
  'ldy abs' : { code: 0xac, size: 3 },
  'ldy abx' : { code: 0xbc, size: 3 },
  'ldy imm' : { code: 0xa0, size: 2 },
  'ldy zp'  : { code: 0xa4, size: 2 },
  'ldy zpx' : { code: 0xb4, size: 2 },
  'lsr abs' : { code: 0x4e, size: 3 },
  'lsr abx' : { code: 0x5e, size: 3 },
  'lsr'     : { code: 0x4a, size: 1 },
  'lsr zp'  : { code: 0x46, size: 2 },
  'lsr zpx' : { code: 0x56, size: 2 },
  'nop abs' : { code: 0x0c, size: 3 },
  'nop abx' : { code: 0xfc, size: 3 },
  'nop'     : { code: 0xea, size: 1 },
  'nop imm' : { code: 0xe2, size: 2 },
  'nop zp'  : { code: 0x64, size: 2 },
  'nop zpx' : { code: 0xf4, size: 2 },
  'ora abs' : { code: 0x0d, size: 3 },
  'ora abx' : { code: 0x1d, size: 3 },
  'ora aby' : { code: 0x19, size: 3 },
  'ora imm' : { code: 0x09, size: 2 },
  'ora izx' : { code: 0x01, size: 2 },
  'ora izy' : { code: 0x11, size: 2 },
  'ora zp'  : { code: 0x05, size: 2 },
  'ora zpx' : { code: 0x15, size: 2 },
  'pha'     : { code: 0x48, size: 1 },
  'php'     : { code: 0x08, size: 1 },
  'pla'     : { code: 0x68, size: 1 },
  'plp'     : { code: 0x28, size: 1 },
  'rla abs' : { code: 0x2f, size: 3 },
  'rla abx' : { code: 0x3f, size: 3 },
  'rla aby' : { code: 0x3b, size: 3 },
  'rla izx' : { code: 0x23, size: 2 },
  'rla izy' : { code: 0x33, size: 2 },
  'rla zp'  : { code: 0x27, size: 2 },
  'rla zpx' : { code: 0x37, size: 2 },
  'rol abs' : { code: 0x2e, size: 3 },
  'rol abx' : { code: 0x3e, size: 3 },
  'rol'     : { code: 0x2a, size: 1 },
  'rol zp'  : { code: 0x26, size: 2 },
  'rol zpx' : { code: 0x36, size: 2 },
  'ror abs' : { code: 0x6e, size: 3 },
  'ror abx' : { code: 0x7e, size: 3 },
  'ror'     : { code: 0x6a, size: 1 },
  'ror zp'  : { code: 0x66, size: 2 },
  'ror zpx' : { code: 0x76, size: 2 },
  'rra abs' : { code: 0x6f, size: 3 },
  'rra abx' : { code: 0x7f, size: 3 },
  'rra aby' : { code: 0x7b, size: 3 },
  'rra izx' : { code: 0x63, size: 2 },
  'rra izy' : { code: 0x73, size: 2 },
  'rra zp'  : { code: 0x67, size: 2 },
  'rra zpx' : { code: 0x77, size: 2 },
  'rti'     : { code: 0x40, size: 1 },
  'rts'     : { code: 0x60, size: 1 },
  'sax abs' : { code: 0x8f, size: 3 },
  'sax izx' : { code: 0x83, size: 2 },
  'sax zp'  : { code: 0x87, size: 2 },
  'sax zpy' : { code: 0x97, size: 2 },
  'sbc abs' : { code: 0xed, size: 3 },
  'sbc abx' : { code: 0xfd, size: 3 },
  'sbc aby' : { code: 0xf9, size: 3 },
  'sbc imm' : { code: 0xe9, size: 2 },
  'sbc izx' : { code: 0xe1, size: 2 },
  'sbc izy' : { code: 0xf1, size: 2 },
  'sbc zp'  : { code: 0xe5, size: 2 },
  'sbc zpx' : { code: 0xf5, size: 2 },
  'sec'     : { code: 0x38, size: 1 },
  'sed'     : { code: 0xf8, size: 1 },
  'sei'     : { code: 0x78, size: 1 },
  'shx aby' : { code: 0x9e, size: 3 },
  'shy abx' : { code: 0x9c, size: 3 },
  'slo abs' : { code: 0x0f, size: 3 },
  'slo abx' : { code: 0x1f, size: 3 },
  'slo aby' : { code: 0x1b, size: 3 },
  'slo izx' : { code: 0x03, size: 2 },
  'slo izy' : { code: 0x13, size: 2 },
  'slo zp'  : { code: 0x07, size: 2 },
  'slo zpx' : { code: 0x17, size: 2 },
  'sre abs' : { code: 0x4f, size: 3 },
  'sre abx' : { code: 0x5f, size: 3 },
  'sre aby' : { code: 0x5b, size: 3 },
  'sre izx' : { code: 0x43, size: 2 },
  'sre izy' : { code: 0x53, size: 2 },
  'sre zp'  : { code: 0x47, size: 2 },
  'sre zpx' : { code: 0x57, size: 2 },
  'sta abs' : { code: 0x8d, size: 3 },
  'sta abx' : { code: 0x9d, size: 3 },
  'sta aby' : { code: 0x99, size: 3 },
  'sta izx' : { code: 0x81, size: 2 },
  'sta izy' : { code: 0x91, size: 2 },
  'sta zp'  : { code: 0x85, size: 2 },
  'sta zpx' : { code: 0x95, size: 2 },
  'stx abs' : { code: 0x8e, size: 3 },
  'stx zp'  : { code: 0x86, size: 2 },
  'stx zpy' : { code: 0x96, size: 2 },
  'sty abs' : { code: 0x8c, size: 3 },
  'sty zp'  : { code: 0x84, size: 2 },
  'sty zpx' : { code: 0x94, size: 2 },
  'tas aby' : { code: 0x9b, size: 3 },
  'tax'     : { code: 0xaa, size: 1 },
  'tay'     : { code: 0xa8, size: 1 },
  'tsx'     : { code: 0xba, size: 1 },
  'txa'     : { code: 0x8a, size: 1 },
  'txs'     : { code: 0x9a, size: 1 },
  'tya'     : { code: 0x98, size: 1 },
  'xaa imm' : { code: 0x8b, size: 2 }
};

const zeroPageModes = {
  'abs': 'zp',
  'abx': 'zpx',
  'aby': 'zpy',
};

const branchMnemonics = [
  'bcc',
  'bcs',
  'beq',
  'bmi',
  'bne',
  'bpl',
  'bvc',
  'bvs'
];

function twosComplement(data8) {
  return (0xff + data8 + 1);
}

function error(string, line) {
  let error = new Error(string);
  error.line = line;
  throw error;
}

function evalExpression(expr, symbols, lc) {
  if (typeof(expr.resolvedValue) !== 'undefined') {
    return [expr.term, expr.resolvedValue];
  }

  let [term, value] = evalExpr(expr, symbols, lc);

  expr.term = term;
  expr.resolvedValue = value;

  return [term, value];
}

function evalExpr(expr, symbols, lc) {
  let term, value;

  switch (expr.type) {
    case 'unary':
      [term, value] = evalExpr(expr.argument, symbols, lc);

      if (expr.operator !== null && typeof(value) === 'number') {
        switch (expr.operator) {
        case '-':
          value = -value;
          break;
        case '~':
          value = ~value;
          break;
        case '!':
          value = (!value) ? 1 : 0;
          break;
        case '<':
          value = value & 0xff;
          break;
        case '>':
          value = value >> 8;
          break;
        default:
          error(`Unknown unary operator '${expr.operator}'`);
        }
      }
      break;
    case 'binary':
      let [left, lv] = evalExpr(expr.left, symbols, lc);
      let [right, rv] = evalExpr(expr.right, symbols, lc);

      if (typeof(lv) === 'number' && typeof(rv) === 'number') {
        switch (expr.operator) {
        case '+':
          value = lv + rv;
          break;
        case '-':
          value = lv - rv;
          break;
        case '*':
          value = lv * rv;
          break;
        case '/':
          value = Math.floor(lv / rv);
          break;
        case '<<':
          value = lv << rv;
          break;
        case '>>':
          value = lv >> rv;
          break;
        case '<=':
          value = (lv <= rv) ? 1 : 0;
          break;
        case '>=':
          value = (lv >= rv) ? 1 : 0;
          break;
        case '<':
          value = (lv < rv) ? 1 : 0;
          break;
        case '>':
          value = (lv > rv) ? 1 : 0;
          break;
        case '==':
          value = (lv === rv) ? 1 : 0;
          break;
        case '!=':
          value = (lv !== rv) ? 1 : 0;
          break;
        case '&':
          value = lv & rv;
          break;
        case '^':
          value = lv ^ rv;
          break;
        case '|':
          value = lv | rv;
          break;
        case '&&':
          value = lv && rv;
          break;
        case '||':
          value = lv || rv;
          break;
        default:
          error(`Unknown binary operator '${expr.operator}'`);
        }
      } else {
        value = undefined;
      }
      break;
    case 'term':
      term = expr.value;
      value = term.value;
      if (term.type === 'label') {
        if (value === '*') {
          value = lc;
        } else {
          value = symbols[value];
        }
      }
      break;
    default:
      error(`Unknown expression type '${expr.type}'`);
  }

  return [term, value];
}

function getAddressingMode(statement) {
  if (statement.type !== 'inst' || statement.operand === null) {
    return null;
  }

  let mode = statement.operand.mode;

  if (branchMnemonics.includes(statement.name)) {
    return 'rel';
  }

  let zpOp = `${statement.name} ${zeroPageModes[statement.operand.mode]}`;
  if (!mnemonics[zpOp]) {
    return mode;
  }

  let expr = statement.operand.expr;
  let term = expr.term;
  let value = expr.resolvedValue;

  // If value is unresolved, do not optimize, warn later
  if (typeof(value) === 'undefined') {
    statement.failedToOptimize = true;
    return mode;
  }

  // If possible, optimize using zero-page mode instruction
  if (value <= 0xff && mnemonics[zpOp]) {
    mode = zeroPageModes[statement.operand.mode];
  }

  return mode;
}

// pass() returns an object that contains the symbols table and a flag that
// indicates if there are still unresolved symbols.
function pass(AST, symbols, lc) {
  let unresolved = false;
  let seen = {};

  if (typeof(symbols) === 'undefined') { symbols = {}; }

  // If making a pass on a Macro body, LC is provided, else start at $0
  if (typeof(lc) === 'undefined') { lc = 0x0; }

  for (let statement of AST.body) {
    switch (statement.type) {
      case 'label':
        if (typeof(seen[statement.name]) !== 'undefined') {
          error(`Label '${statement.name}' already defined`, statement.line);
        }
        symbols[statement.name] = lc;
        seen[statement.name] = true;
        break;

      case 'label_def':
        let [term, value] = evalExpression(statement.expr, symbols, lc);

        if (typeof(value) === 'undefined') {
          unresolved = true;
          if (statement.name === '*') {
            lc = undefined;
          }
          break;
        }

        // If redefining LC, set new LC from value
        if (statement.name === '*') {
          lc = value;
        } else {
          if (typeof(seen[statement.name]) !== 'undefined') {
            error(`Label '${statement.name}' already defined`,
              statement.line);
          }
          symbols[statement.name] = value;
          seen[statement.name] = true;
        }
        break;

      case 'inst':
        // Fetch opcode and increment LC
        let opKey = statement.name;
        if (statement.operand !== null) {
          let expr = statement.operand.expr;
          evalExpression(expr, symbols, lc);

          let mode = getAddressingMode(statement);
          statement.operand.mode = mode;

          opKey += ` ${mode}`;
        }

        let op = mnemonics[opKey];
        if (typeof(op) === 'undefined') {
          error(`Unknown mnemonic '${opKey}'`, statement.line);
        }

        statement.opcode = op.code;
        statement.size = op.size;

        lc += op.size;
        statement.location = lc;
        break;

      case 'directive':
        if (typeof(lc) === 'undefined') break;

        if (statement.name === 'byte') {
          // There might be string values (because .aasc is an alias of .byte)
          // In that case, increment PC by the length of strings
          for (let expr of statement.exprs) {
            let [term, value] = evalExpression(expr, symbols, lc);

            if (typeof(term) === 'undefined') {
              console.log(`Warning: .byte with unresolved symbol at ` +
                `line ${statement.line}. Going to assume size 1`);
            }

            if (typeof(value) === 'string') {
              lc += value.length;
            } else {
              lc += 1;
            }
          }
        } else if (statement.name === 'word') {
          lc += statement.exprs.length * 2;
        } else if (statement.name === 'res') {
          let [lenTerm, lenValue] = evalExpression(statement.len, symbols, lc);

          if (typeof(lenValue) !== 'undefined') {
            lc += lenValue;
          } else {
            unresolved = true;
            lc = undefined;
          }
        }
        break;

      default:
        error(`Unknown statement type '${statement.type}'`, statement.line);
    }
  }

  return {
    symbols: symbols,
    lc: lc,
    unresolved: unresolved
  };
}

function generateCode(AST, symbols) {
  let objCode = [];

  for (let statement of AST.body) {
    switch (statement.type) {
      case 'directive':
        switch (statement.name) {
          case 'byte':
            // Because .byte allows bytes or string values,
            // convert each string into a byte array.
            for (let expr of statement.exprs) {
              let [term, value] = evalExpression(expr, symbols);
              if (typeof(value) === 'string') {
                for (let chr of value.split('')) {
                  objCode.push(chr.charCodeAt(0));
                }
              } else {
                if (value > 0xff) {
                  error(`Label '${term.value}' used in .byte directive ` +
                    `refers to a 16-bit value`, statement.line);
                }
                objCode.push(value);
              }
            }
            break;

          case 'word':
            for (let expr of statement.exprs) {
              let [_, value] = evalExpression(expr, symbols);
              objCode.push(value & 0xff);
              objCode.push(value >> 8);
            }
            break;

          case 'res':
            let term, fillByteValue, lenValue;
            [term, lenValue] = evalExpression(statement.len, symbols);
            if (statement.fillByte) {
              [term, fillByteValue] = evalExpression(statement.fillByte, symbols);

              if (fillByteValue > 0xff) {
                error(`Fill value '${fillByteValue}' used in .res directive ` +
                  `is not an 8-bit value`, statement.line);
              }
            } else {
              fillByteValue = 0;
            }

            for (let i = 0; i < lenValue; i++) {
              objCode.push(fillByteValue);
            }

            break;

          default:
            error(`Unknown statement name '${statement.name}'`,
              statement.line);
        }
        break;

      case 'inst':

        // Check for undefined labels
        if (statement.operand !== null) {
          let [term, value] = evalExpression(statement.operand.expr, symbols);

          if (typeof(term) !== 'undefined' && term.type === 'label') {
            if (term.value !== '*' && typeof(value) === 'undefined') {
              error(`Label '${term.value}' not defined`, statement.line);
            }
          }

          // Warn user that instruction could have been optimized to use
          // zero-page but failed to do so because at the time, operand was
          // unresolved.
          if (value < 0xff && statement.failedToOptimize) {
            console.warn(`Failed to optimize instruction because of forward` +
              ` reference '${term.value}' (line ${statement.line})`);
          }
        }

        // For instructions with labels as operands, check if reference
        // is valid.
        if (statement.operand !== null) {
          let mode = statement.operand.mode;
          let [term, value] = evalExpression(statement.operand.expr, symbols);

          if (typeof(term) !== 'undefined' && term.type === 'label') {
            // If mode is Relative, check for relative addresses out of bounds
            if (mode === 'rel') {
              let relAddr = value - statement.location;

              if (relAddr <= -127 || relAddr >= 128) {
                error(`Relative address out of bounds ` +
                      `(label '${term.value}')`, statement.line);
              }

            // If mode is Immediate or Indexed, check if label refers to an
            // 8-bit value or zero-page address.
            } else if (['imm', 'izx', 'izy'].includes(mode)) {
              let addr = (term.value === '*') ?
                statement.location : value;

              if (addr > 0xff) {
                error(`Label refers to a 16-bit value ` +
                      `(label '${term.value}')`, statement.line);
              }
            }
          }
        }

        // Generate object code
        if (statement.size === 1) {
          objCode.push(statement.opcode);
        } else if (statement.size === 2) {
          let [term, data] = evalExpression(statement.operand.expr, symbols);
          let dataVal;

          if (term.value !== '*' && typeof(data) === 'undefined') {
            error(`Failed to resolve ${term.type} '${term.value}'`,
              statement.line);
          }

          if (term.type === 'label') {
            if (term.value === '*') {
              dataVal = statement.location;
            } else {
              dataVal = data;
              if (statement.operand.mode === 'rel') {
                dataVal -= statement.location;
              }
            }
          } else {
            dataVal = data;
          }

          if (dataVal < 0) {
            dataVal = twosComplement(dataVal);
          }

          objCode.push(statement.opcode);
          objCode.push(dataVal);
        } else {
          let [term, data] = evalExpression(statement.operand.expr, symbols);
          let dataVal;

          if (typeof(term) !== 'undefined' && term.value !== '*' && typeof(data) === 'undefined') {
            error(`Failed to resolve ${term.type} '${term.value}'`,
              statement.line);
          }

          if (typeof(term) !== 'undefined' && term.type === 'label') {
            if (term.value === '*') {
              dataVal = statement.location - statement.size;
            } else {
              dataVal = data;
            }
          } else {
            dataVal = data;
          }

          objCode.push(statement.opcode);
          objCode.push(dataVal & 0xff);
          objCode.push(dataVal >> 8);
        }
        break;

      // These statements are irrelevant on code generation...
      case 'label':
      case 'label_def':
        break;

      default:
        error(`Unknown statement type '${statement.type}'`, statement.line);
    }
  }

  return objCode;
}

exports.assemble = function(AST, options) {
  options = options || {};

  let objCode;

  // Do multiple passes until all symbols are resolved
  let symbols = {};
  let unresolvedSymbols = [];
  let unresolved = true;

  for (let i = 1; i <= 32; i++) {
    // `symbols` are handed as arguments so that they are
    // reutilized on each pass.
    let res = pass(AST, symbols);
    if (options.debug) {
      console.log(`Pass ${i}`);
      if (res.unresolved) {
        unresolvedSymbols = [];
        for (let k in res.symbols) {
          if (typeof(res.symbols[k]) === 'undefined' || typeof(res.symbols[k]) === 'null') {
            unresolvedSymbols.push(k);
          }
        }
        console.log(`  unresolved symbols: ${unresolvedSymbols}`);
      }
    }

    unresolved = res.unresolved;
    symbols = res.symbols;

    if (!unresolved) break;
  }

  if (unresolved) {
    error(`Failed to resolve: ${unresolvedSymbols}`)
  }

  // Now that the symbols table is generated, generate object code with it.
  objCode = generateCode(AST, symbols);

  if (options.debug) { console.log('Done'); }

  return { objectCode: objCode, symbolTable: symbols };
}
