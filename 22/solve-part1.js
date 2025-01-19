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

const size = 10007;
let cards = Array(size)
  .fill(0)
  .map((_, i) => i);

const cut = (cards, n) => cards.slice(n).concat(cards.slice(0, n));
const deal = (cards, incr) => {
  if (incr === 0) return cards.slice().reverse();
  let shuffle = Array(cards.length).fill(0);
  for (let i = 0; i < cards.length; i++) {
    shuffle[(i * incr) % cards.length] = cards[i];
  }
  return shuffle;
};

for (const [instr, n] of instructions) {
  if (instr === 'cut') {
    cards = cut(cards, n);
  } else if (instr === 'deal') {
    cards = deal(cards, n);
  }
}

let answer = cards.findIndex((x) => x === 2019);

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
