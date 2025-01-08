import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, nums, timer } from '../utils.js';

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

const toinput = (script) => {
  let inputs = [];
  for (const line of script) {
    inputs.push(...line.split('').map((c) => c.charCodeAt(0)), 10);
  }

  return inputs;
};

const inv = {
  north: 'south',
  south: 'north',
  west: 'east',
  east: 'west',
};

const paths = {
  exit: [
    'south',
    'east',
    'east',
    'east',
    'east',
    'east',
    'south',
    'west',
    'west',
  ],
  mutex: ['south'],
  mug: ['south', 'east'],
  manifold: ['south', 'south'],
  'klein bottle': ['south', 'south', 'west', 'west'],
  polygon: ['south', 'east', 'east'],
  loom: ['south', 'east', 'east', 'north'],
  hypercube: ['south', 'east', 'east', 'north', 'north'],
  pointer: ['south', 'east', 'east', 'east', 'east', 'east'],

  'escape pod': ['south', 'east', 'east', 'east', 'east'],
  photons: ['south', 'east', 'east', 'east', 'east', 'north'],
  'infinite loop': ['south', 'south', 'west'],
  'molten lava': ['north'],
  'giant electromagnet': ['west'],
};

const back = (path) => path.reverse().map((p) => inv[p]);

const gotake = (item) => [...paths[item], 'take ' + item, ...back(paths[item])];

function tryeverything() {
  const items = [
    'mutex',
    'mug',
    'manifold',
    'polygon',
    'loom',
    'hypercube',
    'pointer',
    'klein bottle',
  ];
  let steps = [];
  for (const item of items) {
    steps.push('drop ' + item);
  }
  for (let i = 0; i < items.length; i++) {
    steps.push('take ' + items[i]);
    steps.push('west');
    for (let j = i + 1; j < items.length; j++) {
      steps.push('take ' + items[j]);
      steps.push('west');
      for (let k = j + 1; k < items.length; k++) {
        steps.push('take ' + items[k]);
        steps.push('west');
        for (let l = k + 1; l < items.length; l++) {
          steps.push('take ' + items[l]);
          steps.push('west');
          steps.push('drop ' + items[l]);
        }
        steps.push('drop ' + items[k]);
      }
      steps.push('drop ' + items[j]);
    }
    steps.push('drop ' + items[i]);
  }
  return steps;
}

let inputs = toinput([
  ...gotake('mutex'),
  ...gotake('mug'),
  ...gotake('manifold'),
  ...gotake('polygon'),
  ...gotake('loom'),
  ...gotake('hypercube'),
  ...gotake('pointer'),
  ...gotake('klein bottle'),
  ...paths['exit'],
  'inv',
  ...tryeverything(),
]);

let answer = 0;
let res = '';
for (const out of run(code.slice(0), inputs)) {
  answer = out;
  if (out === 10) {
    consola.log(res);
    res = '';
  } else {
    res += String.fromCharCode(out);
  }
}
consola.log(res);

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
