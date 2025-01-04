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

const stock = new Map();

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

let answer = produce(1, 'FUEL');

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
