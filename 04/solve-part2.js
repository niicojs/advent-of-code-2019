import { consola } from 'consola';
import clipboard from 'clipboardy';
import { getCurrentDay, getRawData, timer } from '../utils.js';

consola.wrapAll();

const day = getCurrentDay();
consola.start('Starting day ' + day);
const t = timer();

const [from, to] = getRawData().trim().split('-');

function check(password) {
  const str = password.toString();
  let ok = true;
  let double = false;
  for (let i = 1; i < str.length; i++) {
    if (
      (i === 0 || str[i - 2] !== str[i]) &&
      str[i] === str[i - 1] &&
      (i === str.length - 1 || str[i + 1] !== str[i])
    )
      double = true;
    if (str[i] < str[i - 1]) ok = false;
  }
  return ok && double;
}

let answer = 0;
for (let i = +from; i <= +to; i++) {
  if (check(i)) answer++;
}

consola.success('result', answer);
consola.success('Done in', t.format());
clipboard.writeSync(answer?.toString());
