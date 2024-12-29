import { consola } from 'consola';
import clipboard from 'clipboardy';
import {
  enumGrid,
  getCurrentDay,
  getDataLines,
  getGrid,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const grid = getGrid(getDataLines());

const asteroids = [];
for (const { cell, x, y } of enumGrid(grid)) {
  if (cell === '#') asteroids.push([x, y]);
}

let best = [0, null];
for (const [x1, y1] of asteroids) {
  const set = new Set();
  for (const [x2, y2] of asteroids) {
    if (x1 === x2 && y1 === y2) continue;
    const v = [x2 - x1, y2 - y1];
    if (v[0] === 0) {
      set.add('v' + ',' + (y2 > y1));
    } else {
      set.add((v[1] / v[0]).toFixed(6) + ',' + (x2 > x1));
    }
  }
  if (set.size > best[0]) best = [set.size, [x1, y1]];
}

let answer = best[0];
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
