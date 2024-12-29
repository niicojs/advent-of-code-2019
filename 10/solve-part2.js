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

let best = [[0, 0], new Map()];
for (const [x1, y1] of asteroids) {
  const map = new Map();
  for (const [x2, y2] of asteroids) {
    if (x1 === x2 && y1 === y2) continue;
    const v = [x2 - x1, y2 - y1];
    const angle = (
      ((Math.atan2(v[0], -v[1]) * 180) / Math.PI + 360) %
      360
    ).toFixed(6);
    if (!map.has(angle)) map.set(angle, []);
    map.get(angle).push([x2, y2]);
  }
  if (map.size > best[1].size) best = [[x1, y1], map];
}

let map = best[1];

function find(target) {
  let round = 1;
  while (true) {
    const thisround = map.values().filter((v) => v.length >= round);
    if (target > thisround.length) {
      target -= thisround.length;
      round++;
      break;
    }
    const angles = Array.from(map.keys()).sort((a, b) => a - b);
    return map.get(angles.at(target - 1)).at(-round);
  }
}

let pos = find(200);
let answer = pos[0] * 100 + pos[1];
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
