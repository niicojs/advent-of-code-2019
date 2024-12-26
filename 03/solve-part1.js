import { consola } from 'consola';
import clipboard from 'clipboardy';
import {
  getCurrentDay,
  getDataLines,
  manhattan,
  nums,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const wires = getDataLines().map((l) => l.split(','));

const key = (x, y) => `${x},${y}`;

const dirs = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
};

const paths = [];
for (const wire of wires) {
  const path = new Set();
  let pos = [0, 0];
  for (const step of wire) {
    const [d, n] = [step[0], +step.slice(1)];
    const [dx, dy] = dirs[d];
    for (let i = 0; i < n; i++) {
      pos = [pos[0] + dx, pos[1] + dy];
      path.add(key(...pos));
    }
  }
  paths.push(path);
}

let res = paths[0].intersection(paths[1]);
const answer = Array.from(res)
  .map((x) => manhattan([0, 0], nums(x)))
  .sort((a, b) => a - b)[0];

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
