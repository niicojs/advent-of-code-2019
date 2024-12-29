import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();
const code = nums(getRawData());
let [BLACK, WHITE, LEFT, RIGHT] = [0, 1, 0, 1];

function* run(program, inputs) {
  let base = 0;
  // let out = null;
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
        ''.toString();
        // set(a, yield);
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      // out = a;
      // consola.log('out', a);
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

const key = (x, y) => `${x},${y}`;

function draw() {
  let pos = [0, 0];
  let dir = [0, 1];
  let grid = new Map();

  let value = 0;
  let done = false;
  const prog = run(code, []);
  while (true) {
    // get color
    value = grid.get(key(...pos)) || 0;
    ({ value, done } = prog.next(value));
    let color = value;
    if (done) break;

    // get next direction
    grid.set(key(...pos), color);
    ({ value, done } = prog.next());
    let turn = value;

    if (turn === LEFT) dir = [dir[1], -dir[0]];
    if (turn === RIGHT) dir = [-dir[1], dir[0]];

    pos = [pos[0] + dir[0], pos[1] + dir[1]];
  }

  return grid;
}

const grid = draw();

let answer = grid.size;
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
