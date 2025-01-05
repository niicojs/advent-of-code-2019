import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

let phase = [0, 1, 0, -1];

let short = getRawData().trim().split('').map(Number);
let values = [];

let residx = Number(short.slice(0, 7).join(''));
consola.log(residx, residx % short.length)

const step = (input) => {
  let output = [];
  for (let x = 1; x <= input.length; x++) {
    let res = 0;
    for (let i = 0; i < input.length; i++) {
      const p = phase[Math.floor((i + 1) / x) % phase.length];
      res += input[i] * p;
    }
    output.push(Math.abs(res) % 10);
  }
  return output;
};

for (let i = 0; i < 100; i++) values = step(values);

let answer = values.slice(0, 8).join('');

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
