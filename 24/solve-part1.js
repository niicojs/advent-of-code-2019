import { consola } from 'consola';
import clipboard from 'clipboardy';
import {
  enumGrid,
  getCurrentDay,
  getDataLines,
  getDirectNeighbors,
  getGrid,
  inGridRange,
  newGrid,
  printGrid,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

let grid = getGrid(getDataLines());

const step = (grid) => {
  const g = newGrid(grid.length, grid[0].length, '.');
  for (const { x, y, cell } of enumGrid(grid)) {
    const n = getDirectNeighbors(x, y).filter(
      ([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] === '#'
    );
    if (cell === '#' && n.length !== 1) {
      g[y][x] = '.';
    } else if (cell === '.' && [1, 2].includes(n.length)) {
      g[y][x] = '#';
    } else {
      g[y][x] = cell;
    }
  }
  return g;
};

const history = new Set();
function store(g) {
  const key = g.map((l) => l.join('')).join('');
  if (history.has(key)) return true;
  history.add(key);
}

let g = grid;
while (true) {
  g = step(grid);
  if (store(g)) break;
  grid = g;
}

function rating(g) {
  let r = 0;
  for (let y = 0; y < g.length; y++) {
    for (let x = 0; x < g[y].length; x++) {
      if (g[y][x] === '#') r += 2 ** (y * g[0].length + x);
    }
  }
  return r;
}

printGrid(g);

let answer = rating(g);

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
