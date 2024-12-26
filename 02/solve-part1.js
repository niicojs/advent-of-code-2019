import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const program = nums(getRawData());

function run() {
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

program[1] = 12;
program[2] = 2;
let answer = run();

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
