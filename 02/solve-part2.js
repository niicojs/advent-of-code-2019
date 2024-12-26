import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const init = nums(getRawData());

function run(program) {
  for (let pt = 0; pt < program.length; ) {
    const op = program[pt++];
    if (op === 1) {
      const a = program[pt++];
      const b = program[pt++];
      const c = program[pt++];
      program[c] = program[a] + program[b];
    } else if (op === 2) {
      const a = program[pt++];
      const b = program[pt++];
      const c = program[pt++];
      program[c] = program[a] * program[b];
    } else if (op === 99) {
      // consola.log(program);
      return program[0];
    }
  }
}

function solve() {
  for (let a = 0; a < 100; a++) {
    for (let b = 0; b < 100; b++) {
      const program = [...init];
      program[1] = a;
      program[2] = b;
      const answer = run(program);
      if (answer === 19690720) {
        return 100 * a + b;
      }
    }
  }
}

let answer = solve();
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
