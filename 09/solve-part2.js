import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const code = nums(getRawData());

function run(i, program, inputs) {
  let base = 0;
  let out = null;
  let pt = 0;
  const getval = (mode) => {
    if (mode === '0') return program[program[pt++]] || 0;
    if (mode === '1') return program[pt++] || 0;
    if (mode === '2') return program[base + program[pt++]] || 0;
  };
  const getlitteral = (mode) => {
    if (mode === '0' || mode === '1') return program[pt++];
    if (mode === '2') return base + program[pt++];
  };
  const set = (addr, val) => {
    if (addr >= program.length) {
      const ln = program.length;
      program.length = addr + 1;
      program.fill(0, ln);
    }
    program[addr] = val;
  };

  while (true) {
    let op = program[pt++];
    let mode = (~~(op / 100)).toString().padStart(3, '0');
    op = op % 100;

    if (op === 99) {
      return out;
    } else if (op === 1) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a + b);
    } else if (op === 2) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a * b);
    } else if (op === 3) {
      const a = getlitteral(mode.at(-1));
      if (inputs.length) {
        set(a, inputs.shift());
      } else {
        ''.toString();
        // set(a, yield);
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      out = a;
      consola.log(i, 'out', a);
      // yield a;
    } else if (op === 5) {
      const a = getval(mode.at(-1));
      const jump = getval(mode.at(-2));
      if (a) pt = jump;
    } else if (op === 6) {
      const a = getval(mode.at(-1));
      const jump = getval(mode.at(-2));
      if (!a) pt = jump;
    } else if (op === 7) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a < b ? 1 : 0);
    } else if (op === 8) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a === b ? 1 : 0);
    } else if (op === 9) {
      base += getval(mode.at(-1));
    }
  }
}

let answer = run(0, code, [1]);
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());