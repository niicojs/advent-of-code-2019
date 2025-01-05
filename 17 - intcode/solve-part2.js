import { consola } from 'consola';
import clipboard from 'clipboardy';
import {
  getCurrentDay,
  getDirectNeighbors,
  getGrid,
  getRawData,
  inGridRange,
  nums,
  printGrid,
  timer,
} from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();
const code = nums(getRawData());

function* run(program, inputs) {
  let base = 0;
  let pt = 0;
  const getval = (mode) => {
    if (mode === '0') return program[program[pt++]] || 0;
    if (mode === '1') return program[pt++] || 0;
    if (mode === '2') return program[base + program[pt++]] || 0;
  };
  const getlitteral = (mode) => {
    if (mode === '0' || mode === '1') return program[pt++];
    if (mode === '2') return base + program[pt++];
  };
  const set = (addr, val) => {
    if (addr >= program.length) {
      const ln = program.length;
      program.length = addr + 1;
      program.fill(0, ln);
    }
    program[addr] = val;
  };

  while (true) {
    let op = program[pt++];
    let mode = (~~(op / 100)).toString().padStart(3, '0');
    op = op % 100;

    if (op === 99) {
      return;
    } else if (op === 1) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a + b);
    } else if (op === 2) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a * b);
    } else if (op === 3) {
      const a = getlitteral(mode.at(-1));
      if (inputs.length) {
        set(a, inputs.shift());
      } else {
        set(a, yield);
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      const val = yield a;
      if (val !== undefined) inputs.push(val);
    } else if (op === 5) {
      const a = getval(mode.at(-1));
      const jump = getval(mode.at(-2));
      if (a) pt = jump;
    } else if (op === 6) {
      const a = getval(mode.at(-1));
      const jump = getval(mode.at(-2));
      if (!a) pt = jump;
    } else if (op === 7) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a < b ? 1 : 0);
    } else if (op === 8) {
      const a = getval(mode.at(-1));
      const b = getval(mode.at(-2));
      const c = getlitteral(mode.at(-3));
      set(c, a === b ? 1 : 0);
    } else if (op === 9) {
      base += getval(mode.at(-1));
    }
  }
}

let res = '';
for (const out of run(code.slice(0), [])) {
  res += String.fromCharCode(out);
}

const grid = getGrid(res.split('\n').filter(Boolean));
const [W, H] = [grid[0].length, grid.length];
let start = [0, 0];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (grid[y][x] === '^') {
      start = [x, y];
      break;
    }
  }
}

function getPath() {
  let [x, y] = start;
  let path = [];
  while (true) {
    path.push([x, y]);

    let possible = getDirectNeighbors(x, y).filter(
      ([nx, ny]) => inGridRange(grid, nx, ny) && grid[ny][nx] === '#'
    );
    if (path.length <= 2) {
      // first, just take the
      [x, y] = possible[0];
      continue;
    }
    if (possible.length === 1) return path;

    const [px, py] = path.at(-2);
    possible = possible.filter(([nx, ny]) => px !== nx || py !== ny);
    if (possible.length === 1) {
      [x, y] = possible[0];
      continue;
    }

    // cross path
    const [dx, dy] = [x - px, y - py];
    possible = possible.filter(([nx, ny]) => dx === nx - x || dy === ny - y);
    [x, y] = possible[0];
  }
}

const path = getPath();
printGrid(grid, path);

const dirs = [];
let [dx, dy] = [0, -1];
for (let i = 1; i < path.length; i++) {
  const [x, y] = path[i];
  const [px, py] = path[i - 1];
  if (x === px + dx && y === py + dy) {
    dirs[dirs.length - 1] += 1;
  } else {
    const [lx, ly] = [dy, -dx];
    if (x === px + lx && y === py + ly) {
      dirs.push('L');
      [dx, dy] = [lx, ly];
    } else {
      dirs.push('R');
      [dx, dy] = [-lx, -ly];
    }
    dirs.push(1);
  }
}

function compress(strs, r = new Set()) {
  if (r.size === 3) {
    if (strs.length === 0) return r;
    return null;
  }
  // if (r.size === 2) {
  //   if (strs.length > 1) return null;
  //   if (strs[0].length <= 20) return r.union(new Set([strs[0]]));
  //   return null;
  // }
  const str = strs.at(0);
  const arr = str.split(',');
  const two = arr.slice(0, 4).join(',');
  const three = arr.slice(0, 6).join(',');
  const four = arr.slice(0, 8).join(',');
  const five = arr.slice(0, 10).join(',');
  const possible = [...new Set([five, four, three, two])].filter((x) =>
    strs.some((s) => s.slice(x.length).includes(x))
  );
  for (const p of possible) {
    const set = r.union(new Set([p]));
    const left = strs
      .flatMap((s) => s.split(p))
      .map((s) => s.replace(/(^\,)|(\,$)/g, ''))
      .filter(Boolean);

    let res = compress(left, set);
    if (res) return res;
  }

  return null;
}

const set = compress([dirs.join(',')]);
const moves = Array.from(set).sort((a, b) => a - b);

let compressed = dirs.join(',');

let c = 'A'.charCodeAt(0);
for (const move of moves) {
  compressed = compressed.replaceAll(move, String.fromCharCode(c++));
}

const inputs = compressed.split('').map((c) => c.charCodeAt(0));
inputs.push(10);
for (const move of moves) {
  inputs.push(...move.split('').map((c) => c.charCodeAt(0)), 10);
}
inputs.push('n'.charCodeAt(0), 10);

code[0] = 2;

let last = 0;
res = '';
for (const out of run(code, inputs)) {
  // if (out === 10) {
  //   consola.log(res);
  //   res = '';
  // } else {
  //   res += String.fromCharCode(out);
  // }
  last = out;
}

let answer = last;
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
