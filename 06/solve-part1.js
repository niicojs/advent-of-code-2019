import { consola } from 'consola';
import clipboard from 'clipboardy';
import TinyQueue from 'tinyqueue';
import {
  getCurrentDay,
  getDataLines,
  getDirectNeighbors,
  getGrid,
  getRawData,
  inGridRange,
  nums,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const values = getDataLines().map((l) => l.split(')'));
const parents = new Map();
for (const [from, to] of values) parents.set(to, from);

let answer = 0;
for (const key of parents.keys()) {
  let nb = 0;
  let k = key;
  while (parents.has(k)) {
    nb++;
    k = parents.get(k);
  }
  answer += nb;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
