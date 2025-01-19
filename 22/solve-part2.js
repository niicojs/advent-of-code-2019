import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const instructions = [];
const lines = getDataLines();
for (const line of lines) {
  if (line.startsWith('cut')) {
    instructions.push(['cut', +line.slice(4)]);
  } else if (line.startsWith('deal into new stack')) {
    instructions.push(['deal', 0]);
  } else if (line.startsWith('deal with increment')) {
    instructions.push(['deal', +line.slice(20)]);
  }
}

const size = 119315717514047;
// const size = 10007;

function gcdExt(a, b) {
  let x = 0,
    y = 1,
    u = 1,
    v = 0;
  while (a !== 0) {
    let q = Math.floor(b / a);
    [x, y, u, v] = [u, v, x - u * q, y - v * q];
    [a, b] = [b % a, a];
  }
  return [b, x, y];
}

function modinv(a, m) {
  const [g, x] = gcdExt(a, m);
  if (g !== 1) throw new Error('Bad mod inverse');
  return (x + m) % m;
}

// avoir overflow
const mul = (a, b) => Number((BigInt(a) * BigInt(b)) % BigInt(size));

function findpoly() {
  // trouve le polynome res = a * x + b
  // je comprends a peu pres rien au math...
  let [a, b] = [1, 0];
  for (const [instr, n] of instructions.reverse()) {
    if (instr === 'cut') {
      b = (b + n) % size;
    } else if (instr === 'deal') {
      if (n === 0) {
        [a, b] = [-a, size - b - 1];
      } else {
        const z = modinv(n, size);
        // [a, b] = [(a * z) % size, (b * z) % size];
        [a, b] = [mul(a, z), mul(b, z)];
      }
    }
  }
  return [a, b];
}

function ntimes(a, b, p) {
  // (a*x + b) puissance p
  if (p === 0) return [1, 0];
  // f^2(x) = a(ax+b)+b = aax + ab+b
  if (p % 2 === 0) return ntimes(mul(a, a), (mul(a, b) + b) % size, p / 2);

  // f(g(x)) = a(cx+d)+b = acx + ad+b
  let [a1, b1] = ntimes(a, b, p - 1);
  return [mul(a, a1), (mul(a, b1) + b) % size];
}

let [a, b] = findpoly();

// test
// consola.log((a * 7665 + b) % size, 2019);

[a, b] = ntimes(a, b, 101741582076661);

let answer = (mul(a, 2020) + b) % size;

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
