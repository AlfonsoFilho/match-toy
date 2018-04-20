const { match } = require("match-toy");

const factorial = match()
  .with('0', () => 1)
  .with('n', ({n}) => n * factorial(n - 1))
  .end();

console.log('0', factorial(0))
console.log('4', factorial(4))
console.log('10', factorial(10))


const howMany = match()
  .with('[]', () => 'empty')
  .with('[_]', () => 'one')
  .with('[_, _]', () => 'two')
  .with('[_, _, ...]', () => 'more than two')
  .else(() => 'it is not a list')
  .end();

console.log(howMany([]))
console.log(howMany([ 1 ]))
console.log(howMany([ 1, 2 ]))
console.log(howMany([ 1, 2, 3 ]))
console.log(howMany('?'))
