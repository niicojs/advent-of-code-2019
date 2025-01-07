// crazy asumption that the maze is actually made so that solving each quadrant independantly 
// gives the right answer...

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

let starts = [];
const keys = [];
const doors = [];
for (const { x, y, cell } of enumGrid(grid)) {
  if (cell === '@') {
    starts.push([x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]);
    grid[y][x] = '#';
    grid[y + 1][x] = '#';
    grid[y - 1][x] = '#';
    grid[y][x - 1] = '#';
    grid[y][x + 1] = '#';
  } else if (cell >= 'a' && cell <= 'z') {
    keys.push([x, y]);
  } else if (cell >= 'A' && cell <= 'Z') {
    doors.push([x, y]);
  }
}

const [W, H] = [grid[0].length, grid.length];

const grid1 = grid.slice(0, H / 2 + 1).map((l) => l.slice(0, W / 2 + 1));
const start1 = [~~(W / 2) - 1, ~~(H / 2) - 1];
const grid2 = grid.slice(0, H / 2 + 1).map((l) => l.slice(W / 2));
const start2 = [1, ~~(H / 2) - 1];
const grid3 = grid.slice(H / 2).map((l) => l.slice(0, W / 2 + 1));
const start3 = [~~(W / 2) - 1, 1];
const grid4 = grid.slice(H / 2).map((l) => l.slice(W / 2));
const start4 = [1, 1];

const key = (x, y, s) => `${x},${y},${s}`;

function solvesub(grid, start) {
  printGrid(grid, [start]);

  const isKey = (x, y) => grid[y][x] >= 'a' && grid[y][x] <= 'z';

  let skeys = [];
  for (const { x, y } of enumGrid(grid)) {
    if (isKey(x, y)) skeys.push([x, y]);
  }
  // consola.log(skeys);

  function search() {
    const todo = new TinyQueue(
      [{ pos: start, score: 0, collected: [] }],
      (a, b) => a.score - b.score
    );
    const visited = new Set();
    while (todo.length > 0) {
      const {
        pos: [x, y],
        score,
        collected,
      } = todo.pop();

      if (collected.length === skeys.length) return score;

      const k = key(x, y, collected.join(''));
      if (visited.has(k)) continue;
      visited.add(k);

      const possible = getDirectNeighbors(x, y).filter(
        ([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] !== '#'
      );

      for (const [nx, ny] of possible) {
        let s = collected;
        if (isKey(nx, ny) && !collected.includes(grid[ny][nx])) {
          s = collected.concat(grid[ny][nx]).sort();
        }
        todo.push({ pos: [nx, ny], score: score + 1, collected: s });
      }
    }
  }

  const res = search();
  consola.log(res);
  return res;
}

const one = solvesub(grid1, start1);
const two = solvesub(grid2, start2);
const three = solvesub(grid3, start3);
const four = solvesub(grid4, start4);

let answer = one + two + three + four;
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
