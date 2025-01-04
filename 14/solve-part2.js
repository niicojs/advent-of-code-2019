import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const map = new Map();
const lines = getDataLines();
for (const line of lines) {
  const [one, two] = line.split(' => ');
  const [n, to] = two.split(' ');
  const need = one.split(', ');

  map.set(to, [+n, need.map((x) => x.split(' ')).map(([a, b]) => [+a, b])]);
}

let stock = new Map();

const produce = (n, metal) => {
  if (metal === 'ORE') return n;

  const [get, needs] = map.get(metal);

  if (stock.has(metal)) {
    const s = stock.get(metal);
    if (s >= n) {
      stock.set(metal, s - n);
      return 0;
    } else {
      stock.delete(metal);
      n -= s;
    }
  }

  let build = Math.ceil(n / get);

  let res = 0;
  for (const [a, b] of needs) res += produce(a * build, b);

  if (build * get - n > 0) stock.set(metal, build * get - n);

  return res;
};

const search = (n) => {
  stock = new Map();
  return produce(n, 'FUEL') <= 1_000_000_000_000;
};

function binarysearch(min, max) {
  let left = min;
  let right = max;
  while (left < right) {
    const mid = Math.ceil((left + right) / 2);
    if (search(mid)) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }
  return left;
}

const answer = binarysearch(0, 1_000_000_000);

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
