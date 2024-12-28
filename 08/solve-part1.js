import { consola } from 'consola';
import clipboard from 'clipboardy';
import { chunk, count, getCurrentDay, getRawData, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const raw = getRawData().trim().split('').map(Number);
const w = 25;
const h = 6;

const layers = chunk(raw, w * h);
let best = [Infinity, null];
for (const layer of layers) {
  const zeros = count(layer, 0);
  if (zeros < best[0]) {
    best = [zeros, layer];
  }
}

let answer = count(best[1], 1) * count(best[1], 2);

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
