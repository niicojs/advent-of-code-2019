import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const values = getDataLines().map((l) => l.split(')'));
const parents = new Map();
for (const [from, to] of values) parents.set(to, from);

function findParents(node) {
  const p = [];
  let k = node;
  while (parents.has(k)) {
    k = parents.get(k);
    p.push(k);
  }
  return p;
}

const p1 = findParents('YOU');
const p2 = findParents('SAN');
const common = p1.find((c) => p2.includes(c));
const aller = p1.indexOf(common);
const retour = p2.indexOf(common);
let answer = aller + retour;

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
