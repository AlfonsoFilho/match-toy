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


```javascript

// '{x, y}'  
// 'x, y'
// '[x, _, z]'
// '[head, ...tail]'
// '[]'
// 'x:xs'
// `2|'two'
// '{x: _, y: boundVar}'
// 0
// '_'

// 'x, y'
[
	{name: 'x', type: 'bound', value: getFromInput(0)},
	{name: 'y', type: 'bound', value: undefined}
]

// 0
[
	{name: undefined, type: 'literal', value: getFromInput(0)}
]

// '_'
[
	{name: undefined, type: 'wildcard', value: getFromInput(0)}
]

// 1|'one'
[
	{name: undefined, type: 'union', value: union(0, 'one')}
]

// '[x, _, z, 1]'
[
	{name: undefined, type: 'list', value: [
		{name: 'x', type: 'bound', value: getFromInput(0, 0)},
		{name: undefined, type: 'wildcard', value: getFromInput(0, 1)},
		{name: 'z', type: 'bound', value: getFromInput(0, 2)}
		{name: undefined, type: 'literal', value: 1}
	]}
]

// []
[
	{name: undefined, type: 'list', value: []}
]

// '{x: _, y: boundVar, z: { a, b: 1 }}, 1'
[
	{name: undefined, type: 'object', value: [
		{name: 'x', key: 'x' type: 'wildcard', value: getFromInput(0, 0)},
		{name: 'boundVar' key: 'y', type: 'bound', value: getFromInput(0, 1)},
		{name: undefined key: 'z', type: 'object', value: [
			{name: 'a', key: 'a' type: 'bound', value: getFromInput(0, 2, 1)},
			{name: 'b', key: 'b' type: 'literal', value: 1},
		]},
	]},
	{name: undefined, type: 'literal', value: 1}
]

```