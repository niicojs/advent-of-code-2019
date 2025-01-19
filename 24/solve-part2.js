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
  memoize,
  newGrid,
  printGrid,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

function equals(g1, g2) {
  for (let i = 0; i < g1.length; i++) {
    for (let j = 0; j < g1[i].length; j++) {
      if (g1[i][j] !== g2[i][j]) return false;
    }
  }
  return true;
}

let grid = getGrid(getDataLines());
const [W, H] = [grid[0].length, grid.length];

const step = memoize((grid) => {
  const g = newGrid(H, W, '.');
  for (const { x, y, cell } of enumGrid(grid)) {
    let n = 0;
    if (x === 2 && y === 1) {
      n = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
      ]
        .map(([nx, ny]) => grid[ny][nx])
        .concat(...grid[0]);
      n = n.filter((v) => v === '#').length;
    } else if (x === 3 && y === 2) {
      n = [
        [x - 1, y],
        [x, y - 1],
        [x, y - 1],
      ]
        .map(([nx, ny]) => grid[ny][nx])
        .concat(...grid[0]);
      n = n.filter((v) => v === '#').length;
    } else if (x === 1 && y === 2) {
      n = [
        [x - 1, y],
        [x, y - 1],
        [x, y + 1],
      ]
        .map(([nx, ny]) => grid[ny][nx])
        .concat(...grid[0]);
      n = n.filter((v) => v === '#').length;
    } else if (x === 2 && y === 3) {
      n = [
        [x - 1, y],
        [x + 1, y],
        [x, y + 1],
      ]
        .map(([nx, ny]) => grid[ny][nx])
        .concat(...grid[0]);
      n = n.filter((v) => v === '#').length;
    } else {
      n = getDirectNeighbors(x, y).filter(
        ([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] === '#'
      ).length;
    }
    if (cell === '#' && n !== 1) {
      g[y][x] = '.';
    } else if (cell === '.' && [1, 2].includes(n)) {
      g[y][x] = '#';
    } else {
      g[y][x] = cell;
    }
  }
  return g;
});


for (let i = 0; i < 10; i++) {
  grid = step(grid);
  printGrid(grid);
}

let answer = 0;

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
