const { match } = require("match-toy");

const factorial = match
  .case('0', () => 1)
  .case('n', ({n}) => n * factorial(n - 1))
  .end();

console.log('0', factorial(0))
console.log('4', factorial(4))
console.log('10', factorial(10))


const howMany = match()
  .case('[]', () => 'empty')
  .case('[_]', () => 'one')
  .case('[_, _]', () => 'two')
  .case('[_, _, ...]', () => 'more than two')
  .else(() => 'it is not a list')
  .end();

console.log(howMany([]))
console.log(howMany([ 1 ]))
console.log(howMany([ 1, 2 ]))
console.log(howMany([ 1, 2, 3 ]))
console.log(howMany('?'))
