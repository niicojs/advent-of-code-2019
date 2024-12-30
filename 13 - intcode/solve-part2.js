import { consola } from 'consola';
import clipboard from 'clipboardy';
import termkit from 'terminal-kit';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

const term = termkit.terminal;

const day = getCurrentDay();
term.fullscreen();
term.hideCursor();

const end = (quit = false) => {
  term.hideCursor(false);
  term.fullscreen(false);
  if (quit) process.exit(0);
};
process.once('SIGINT', () => end(true));
process.once('SIGTERM', () => end(true));

const t = timer();
const code = nums(getRawData());
code[0] = 2;

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
        set(a, inputs.at(0));
      } else {
        set(a, yield);
      }
    } else if (op === 4) {
      const a = getval(mode.at(-1));
      // consola.log('out', a);
      const val = yield a;
      if (val !== undefined) inputs[0] = val;
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

const [W, H] = [45, 24];

function play() {
  let score = 0;
  let player = null;
  let ball = [0, 0];
  let input = 0;

  let value = 0;
  let done = false;
  const prog = run(code, []);

  while (true) {
    // get x
    ({ value, done } = prog.next(input));
    let x = value;
    if (done) break;

    // get y
    ({ value, done } = prog.next());
    let y = value;

    // get tile
    ({ value, done } = prog.next());
    if (done) break;

    if (x === -1 && y === 0) {
      score = value;
      term.moveTo(0, H + 2);
      term('score: ', score.toString().padStart(5, ' '));
    } else {
      if (player === null) {
        if (value === 3) player = [x, y];
        if (value === 4) ball = [x, y];
      } else {
        if (value === 4) {
          ball = [x, y];
        } else if (value === 3) {
          player = [x, y];
        }
        if (ball[0] < player[0]) input = -1;
        else if (ball[0] > player[0]) input = 1;
        else input = 0;
      }
      term.moveTo(x + 1, y + 1);
      term({ 0: ' ', 1: '█', 2: '#', 3: '═', 4: 'o' }[value]);
    }

    for (let i = 0; i < 2_000_000; i++) {}
  }

  return score;
}

let answer = play();
end();

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
