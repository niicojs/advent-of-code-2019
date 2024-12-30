import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const code = nums(getRawData());

function run(program, inputs) {
  const out = [];
  let pt = 0;
  const getval = (mode) =>
    mode === '0' ? program[program[pt++]] : program[pt++];

  while (true) {
    let op = program[pt++];
    let mode = (~~(op / 100)).toString().padStart(3, '0');
    op = op % 100;

    if (op === 99) {
      return out.at(-1);
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
      program[a] = inputs.shift();
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      out.push(a);
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
  let pass = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    pass = run([...code], [input, pass]);
  }
  return pass;
}

function* possibilities() {
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 4; j++) {
      if (i === j) continue;
      for (let k = 0; k <= 4; k++) {
        if (i === k || j === k) continue;
        for (let l = 0; l <= 4; l++) {
          if (i === l || j === l || k === l) continue;
          for (let m = 0; m <= 4; m++) {
            if (i === m || j === m || k === m || l === m) continue;
            yield [i, j, k, l, m];
          }
        }
      }
    }
  }
}

let answer = 0;
for (const inputs of possibilities()) {
  const pass = full(inputs);
  if (pass > answer) answer = pass;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
