import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const program = nums(getRawData());
const inputs = [1];

function run() {
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
    }
  }
}

let answer = run();
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
