import { consola } from 'consola';
import clipboard from 'clipboardy';
import { chunk, getCurrentDay, getRawData, newGrid, timer } from '../utils.js';
import { colors } from 'consola/utils';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const raw = getRawData().trim().split('').map(Number);
const w = 25;
const h = 6;

const layers = chunk(raw, w * h);
const grid = newGrid(h, w, 0);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    for (const layer of layers) {
      const val = layer[idx];
      if (val === 2) continue;
      grid[y][x] = val;
      break;
    }
  }
}

for (let y = 0; y < h; y++) {
  let line = '';
  for (let x = 0; x < w; x++) {
    if (grid[y][x] === 0) line += ' ';
    else if (grid[y][x] === 1) line += colors.white('█');
    else if (grid[y][x] === 2) line += ' ';
  }
  consola.log(line);
}

let answer = 'BCPZB';
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
