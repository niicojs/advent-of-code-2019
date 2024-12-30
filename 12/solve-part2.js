import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, nums, lcm, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

let moons = [];
const values = getDataLines().map(nums);
for (const [i, [x, y, z]] of values.entries()) {
  moons.push({ i, pos: [x, y, z], vel: [0, 0, 0] });
}
const start = structuredClone(moons);

const gravity = (dimension) => {
  for (let a = 0; a < moons.length; a++) {
    const m1 = moons[a];
    for (let b = a + 1; b < moons.length; b++) {
      const m2 = moons[b];
      if (m1.i === m2.i) continue;
      if (m1.pos[dimension] < m2.pos[dimension]) {
        m1.vel[dimension]++;
        m2.vel[dimension]--;
      } else if (m1.pos[dimension] > m2.pos[dimension]) {
        m1.vel[dimension]--;
        m2.vel[dimension]++;
      } else {
        // no change
      }
    }
  }
};

const velocity = (dimension) => {
  for (const m of moons) {
    m.pos[dimension] += m.vel[dimension];
  }
};

function findLoops(dim) {
  const initial = start
    .map((m) => [m.pos[dim], m.vel[dim]].join('-'))
    .join(',');
  let step = 0;
  while (true) {
    gravity(dim);
    velocity(dim);
    step++;
    const check = moons
      .map((m) => [m.pos[dim], m.vel[dim]].join('-'))
      .join(',');
    if (check === initial) break;
  }
  return step;
}

const periods = [];
for (let dim = 0; dim < 3; dim++) {
  const loop = findLoops(dim);
  periods.push(loop);
}

let answer = lcm(periods);
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
