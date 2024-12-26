import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, timer } from '../utils.js';

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
  let ln = 0;
  const path = new Map();
  let pos = [0, 0];
  for (const step of wire) {
    const [d, n] = [step[0], +step.slice(1)];
    const [dx, dy] = dirs[d];
    for (let i = 0; i < n; i++) {
      pos = [pos[0] + dx, pos[1] + dy];
      path.set(key(...pos), ++ln);
    }
  }
  paths.push(path);
}

let res = new Set(paths[0].keys()).intersection(new Set(paths[1].keys()));
const answer = Array.from(res)
  .map((x) => paths[0].get(x) + paths[1].get(x))
  .sort((a, b) => a - b)[0];

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
