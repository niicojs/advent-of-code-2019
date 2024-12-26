import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getDataLines, sum, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

let answer = sum(getDataLines().map((v) => Math.floor(+v / 3) - 2));

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
