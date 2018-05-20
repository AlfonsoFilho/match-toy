
const { match } = require('match-toy');

const test = match
  .case('1', () => 'one')
  .case('1, 2', () => 'one and two')
  .case('1, 2 | 4, 2 & _, x', ({ x }) => `value: ${x}`)
  .else(() => 'no match')
  .end();

console.log(JSON.stringify(test(1, 2)))