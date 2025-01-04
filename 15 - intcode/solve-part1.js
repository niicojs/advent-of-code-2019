import { consola } from 'consola';
import { colors } from 'consola/utils';
import clipboard from 'clipboardy';
import TinyQueue from 'tinyqueue';
import {
  getCurrentDay,
  getDirectNeighbors,
  getRawData,
  nums,
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

const [NORTH, SOUTH, WEST, EAST] = [1, 2, 3, 4];
const [WALL, EMPTY, OXYGEN] = [0, 1, 2];
const dirs = {
  [NORTH]: [0, -1],
  [SOUTH]: [0, 1],
  [WEST]: [-1, 0],
  [EAST]: [+1, 0],
};
const left = {
  [NORTH]: WEST,
  [SOUTH]: EAST,
  [WEST]: SOUTH,
  [EAST]: NORTH,
};
const right = {
  [NORTH]: EAST,
  [SOUTH]: WEST,
  [WEST]: NORTH,
  [EAST]: SOUTH,
};
const rev = {
  [NORTH]: SOUTH,
  [SOUTH]: NORTH,
  [WEST]: EAST,
  [EAST]: WEST,
};

const key = (x, y, x2, y2) => {
  if (x2 && y2) return `${x},${y},${x2},${y2}`;
  else return `${x},${y}`;
};

const program = run(code, []);
const map = new Map();

function explore(x, y, dir) {
  let [nx, ny] = [x + dirs[dir][0], y + dirs[dir][1]];
  let res = null;

  if (map.has(key(nx, ny))) {
    const l = [x + dirs[left[dir]][0], y + dirs[left[dir]][1]];
    const r = [x + dirs[right[dir]][0], y + dirs[right[dir]][1]];
    if (map.has(key(...l)) && map.has(key(...r))) return null;

    // didn't check left or right
    res = explore(x, y, left[dir]);
    if (!res) res = explore(x, y, right[dir]);
    return res;
  }

  const { value } = program.next(dir);
  if (value === OXYGEN) {
    map.set(key(nx, ny), 'o');
    return [nx, ny];
  }

  if (value === WALL) {
    map.set(key(nx, ny), '█');
    res = explore(x, y, left[dir]);
    if (!res) res = explore(x, y, right[dir]);
  } else if (value === EMPTY) {
    map.set(key(nx, ny), ' ');
    res = explore(nx, ny, dir);
    if (!res) {
      program.next(rev[dir]);
      res = explore(x, y, left[dir]);
      if (!res) res = explore(x, y, right[dir]);
    }
  }

  return res;
}

program.next();
map.set(key(0, 0), '+');
const target = explore(0, 0, NORTH);

function printMap() {
  const points = [...map.keys()].map((k) => k.split(',').map(Number));
  const [minx, maxx] = [
    Math.min(...points.map((p) => p[0])),
    Math.max(...points.map((p) => p[0])),
  ];
  const [miny, maxy] = [
    Math.min(...points.map((p) => p[1])),
    Math.max(...points.map((p) => p[1])),
  ];

  const pad = 4;
  console.log(''.padStart(pad, ' ') + ' ┌' + '─'.repeat(maxx - minx + 1) + '┐');
  for (let y = miny; y <= maxy; y++) {
    let line = y.toString().padStart(pad, ' ') + ' │';
    for (let x = minx; x <= maxx; x++) {
      const v = map.get(key(x, y));
      if (v) line += v;
      else line += colors.gray('?');
    }
    line += '│';
    console.log(line);
  }
  console.log(''.padStart(pad, ' ') + ' └' + '─'.repeat(maxx - minx + 1) + '┘');
}

printMap();
consola.log('target', target);

// now do a proper search to get distance

function search() {
  const todo = new TinyQueue(
    [{ pos: [0, 0], score: 0 }],
    (a, b) => a.score - b.score
  );
  const visited = new Set();
  while (todo.length > 0) {
    const {
      pos: [x, y],
      score,
    } = todo.pop();

    if (x === target[0] && y === target[1]) return score;

    if (visited.has(key(x, y))) continue;
    visited.add(key(x, y));

    const possible = getDirectNeighbors(x, y).filter(([nx, ny]) =>
      [' ', 'o'].includes(map.get(key(nx, ny)))
    );

    for (const [nx, ny] of possible) {
      todo.push({ pos: [nx, ny], score: score + 1 });
    }
  }
}

let answer = search();
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
