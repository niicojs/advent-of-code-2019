import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const code = nums(getRawData());

function* run(i, program, inputs) {
  let out = null;
  let pt = 0;
  const getval = (mode) =>
    mode === '0' ? program[program[pt++]] : program[pt++];

  while (true) {
    let op = program[pt++];
    let mode = (~~(op / 100)).toString().padStart(3, '0');
    op = op % 100;

    if (op === 99) {
      return out;
    } else if (op === 1) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = program[pt++];
      program[c] = a + b;
    } else if (op === 2) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = program[pt++];
      program[c] = a * b;
    } else if (op === 3) {
      const a = program[pt++];
      if (inputs.length) {
        program[a] = inputs.shift();
      } else {
        program[a] = yield;
        ''.toString();
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      out = a;
      yield a;
      ''.toString();
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
      const c = program[pt++];
      program[c] = a < b ? 1 : 0;
    } else if (op === 8) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = program[pt++];
      program[c] = a === b ? 1 : 0;
    }
  }
}

function full(inputs) {
  const progs = inputs.map((n, i) => run(i, [...code], [n]));
  // init all
  progs.forEach((p) => p.next());
  // and run
  let idx = 0;
  let [value, done] = [0, false];
  while (true) {
    // feed input
    ({ value, done } = progs[idx].next(value));
    if (idx === 4 && done) break;

    // go to new input
    ({ done } = progs[idx].next());
    if (idx === 4 && done) break;

    idx = (idx + 1) % 5;
  }
  return value;
}

function* possibilities(from, to) {
  for (let i = from; i <= to; i++) {
    for (let j = from; j <= to; j++) {
      if (i === j) continue;
      for (let k = from; k <= to; k++) {
        if (i === k || j === k) continue;
        for (let l = from; l <= to; l++) {
          if (i === l || j === l || k === l) continue;
          for (let m = from; m <= to; m++) {
            if (i === m || j === m || k === m || l === m) continue;
            yield [i, j, k, l, m];
          }
        }
      }
    }
  }
}

let answer = 0;
for (const inputs of possibilities(5, 9)) {
  answer = Math.max(answer, full(inputs));
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
