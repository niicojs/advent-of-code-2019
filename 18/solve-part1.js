import { consola } from 'consola';
import clipboard from 'clipboardy';
import TinyQueue from 'tinyqueue';
import {
  enumGrid,
  getCurrentDay,
  getDataLines,
  getDirectNeighbors,
  getGrid,
  inGridRange,
  printGrid,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const grid = getGrid(getDataLines());

let start = [];
const keys = [];
const doors = [];
for (const { x, y, cell } of enumGrid(grid)) {
  if (cell === '@') {
    start = [x, y];
    grid[y][x] = '.';
  } else if (cell >= 'a' && cell <= 'z') {
    keys.push([x, y]);
  } else if (cell >= 'A' && cell <= 'Z') {
    doors.push([x, y]);
  }
}

const key = (x, y, s) => `${x},${y},${s}`;

printGrid(grid, [start]);

const isKey = (x, y) => grid[y][x] >= 'a' && grid[y][x] <= 'z';
const isDoor = (x, y) => grid[y][x] >= 'A' && grid[y][x] <= 'Z';

function search() {
  const todo = new TinyQueue(
    [{ pos: start, score: 0, collected: [] }],
    (a, b) => a.score - b.score
  );
  const visited = new Map();
  while (todo.length > 0) {
    const {
      pos: [x, y],
      score,
      collected,
    } = todo.pop();

    if (collected.length === keys.length) return score;

    const col = collected.join('');
    const k = key(x, y);
    if (!visited.has(col)) visited.set(col, new Set());
    if (visited.get(col).has(k)) continue;
    visited.get(col).add(k);

    const possible = getDirectNeighbors(x, y).filter(
      ([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] !== '#'
    );

    for (const [nx, ny] of possible) {
      if (isDoor(nx, ny) && !collected.includes(grid[ny][nx].toLowerCase())) {
        continue;
      }
      let s = collected;
      if (isKey(nx, ny) && !collected.includes(grid[ny][nx])) {
        s = collected.concat(grid[ny][nx]).sort();
      }
      todo.push({ pos: [nx, ny], score: score + 1, collected: s });
    }
  }
}

let answer = search();

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
