# Pattern Matching Lib

```javascript
import { match } from '';
const matchingFunc = match()
	.with('{x, y}', ({x, y}) => x + y)
	.with('x, y', ({x, y}) => x + y)
	.with('x, y', ({x, y}) => x + y, ({x, y}) => x > y)
	.with('[x, _, z]', ({x, y}) => x + y)
	.with('[head, ...tail]', ({head, tail}) => void)
	.with('[]', () => void)
	.with('x:xs', ({x, xs}) => void)
	.with(`2|'two'`, () => 'equal to two')
	.with(`['A', x] <- ['A', 1], ['A', 2], ['B', 3]`, (list) => list === [['A', 1], ['A', 2]])
	.with('{x: _, y: boundVar}', ({boundVar}) => x + y)
  .with(0, () => true).when(isInt)
  .with('_', () => false)
  .else(() => false)
	.catch(() => console.log(error))
	.end()

matchingFunc(0); // output true from 

const matchedValue = match(2)
	.with(2, () => 'two')
	.end()

console.log(matchedValue) /// output 'two'

```