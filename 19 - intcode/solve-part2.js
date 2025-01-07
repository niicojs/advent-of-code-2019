import { consola } from 'consola';
import clipboard from 'clipboardy';
import {
  count,
  getCurrentDay,
  getRawData,
  memoize,
  nums,
  timer,
} from '../utils.js';
import { colors } from 'consola/utils';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();
const code = nums(getRawData());

function* run(program, inputs) {
  let base = 0;
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
      return;
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
        set(a, yield);
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      const val = yield a;
      if (val !== undefined) inputs.push(val);
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

const get = memoize((x, y) => run(code.slice(0), [x, y]).next().value);

let size = 99;

const check = (x, y) => {
  if (get(x, y) === 0) return false;
  if (get(x, y - size) === 0) return false;
  if (get(x + size, y) === 0) return false;
  if (get(x + size, y - size) === 0) return false;
  return true;
};

let [x, y] = [0, 10];
while (true) {
  while (get(x, y) === 0) x++;
  if (check(x, y)) break;
  y++;
}

for (let j = y - 110; j <= y + 10; j++) {
  let line = j.toString().padStart((y + 10).toString().length, ' ') + ' ';
  for (let i = x - 50; i <= x + 120; i++) {
    if (i === x && j === y - size) {
      line += get(i, j) ? colors.blue('█') : ' ';
    } else if (i >= x && i <= x + size && j >= y - size && j <= y) {
      line += get(i, j) ? colors.yellow('█') : ' ';
    } else {
      line += get(i, j) ? '█' : ' ';
    }
  }
  consola.log(line);
}

let answer = x * 10_000 + (y - size);
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
