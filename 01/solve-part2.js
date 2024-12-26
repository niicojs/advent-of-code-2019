import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, sum, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const fuel = (mass) => {
  let res = 0;
  let f = mass;
  do {
    f = Math.floor(f / 3) - 2;
    if (f > 0) res += f;
  } while (f > 0);
  return res;
};

let answer = sum(getDataLines().map((v) => fuel(+v)));

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
