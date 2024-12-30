import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, nums, sum, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const moons = [];
const values = getDataLines().map(nums);
for (const [i, [x, y, z]] of values.entries()) {
  moons.push({ i, pos: [x, y, z], vel: [0, 0, 0] });
}

const gravity = () => {
  for (let a = 0; a < moons.length; a++) {
    const m1 = moons[a];
    for (let b = a + 1; b < moons.length; b++) {
      const m2 = moons[b];
      if (m1.i === m2.i) continue;
      for (let i = 0; i < 3; i++) {
        if (m1.pos[i] < m2.pos[i]) {
          m1.vel[i]++;
          m2.vel[i]--;
        } else if (m1.pos[i] > m2.pos[i]) {
          m1.vel[i]--;
          m2.vel[i]++;
        } else {
          // no change
        }
      }
    }
  }
};

const velocity = () => {
  for (const m of moons) {
    for (let i = 0; i < 3; i++) {
      m.pos[i] += m.vel[i];
    }
  }
};

const energy = () => {
  const potentiel = (m) => sum(m.pos.map((x) => Math.abs(x)));
  const kinetic = (m) => sum(m.vel.map((x) => Math.abs(x)));
  return sum(moons.map((m) => potentiel(m) * kinetic(m)));
};

for (let i = 0; i < 1_000; i++) {
  gravity();
  velocity();
}

let answer = energy();
consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
