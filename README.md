# Match-ish


[![Build Status](https://travis-ci.org/AlfonsoFilho/match-ish.svg?branch=master)](https://travis-ci.org/AlfonsoFilho/match-ish)
[![Test Coverage](https://api.codeclimate.com/v1/badges/7ab1573ab933cb598594/test_coverage)](https://codeclimate.com/github/AlfonsoFilho/match-ish/test_coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/AlfonsoFilho/match-ish.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/match-ish.svg)](https://badge.fury.io/js/match-ish)
[![Try match-ish on RunKit](https://badge.runkitcdn.com/match-ish.svg)](https://npm.runkit.com/match-ish)
> The pattern matching library for javascript.

## What is it?
Match-ish is a pattern matching library for JavaScript. [Pattern matching](https://en.wikipedia.org/wiki/Pattern_matching) is a way to check a sequence of a given input against one or more specific patterns. Many languages like Elixir/Erlang, Rust, F#, Elm, Haskell or Scala have this as a built-in feature.

Pattern matching is a very powerful concept and Match-ish is an attempt to bring this to javascript with an elegant and familiar syntax (jQuery-like chains) plus a simple [domain specific language](#dsl).

With Match-ish, you'll be able to do:
- [Literal Patterns](#literal)
- [Bind Patterns](#bind)
- [Typed Patterns](#typed)
- [Wildcard Patterns](#wildcard)
- [Range Pattern](#range)
- [List splitting](#rest)
- [Logical Pattern](#logical-or)
- [As Pattern](#as)

[Try it now](https://npm.runkit.com/match-ish), then check out how to [install](#install) and [use](#usage) it.

#### Interesting but...
If do you think this looks like an overengineering `switch..case`, let's compare some code then you make your mind.

Let's say, hypothetically, we have to create a function that extracts the name and the address of a user from an object then return a string with a human-friendly message. A kind of task very common on daily work.

So, on a plain javascript version, this function could be something like this:

```javascript
const getUserResponse = (response) => {
  try {
    if(response && response.status === 200) {
      if(response.user) {
        
        let name;
        let address;
        
        if(response.user.name && typeof response.user.name === 'string') {
          name = response.user.name;  
        }

        address = Object.keys(response.user)
              .filter((key) => key !== 'name')
              .reduce((acc, it) => {
                acc[it] = response.user[it];
                return acc;
              }, {});
        if(name && address) {
          return `User name is ${name} and lives on ${formatAddress(address)}` 
        }
        
      } else {
        return 'No user found';
      }
    } else {
      return 'No user found';
    }
  } catch(e) {
    console.log('Error on getUserResponse', e)
  }
}

console.log(getUserResponse(/* user data from server maybe... */))

// About 33 lines of code
```
What if we do the same with Match-ish:
```javascript
// Using match-ish
import { match } from 'match-ish'

const getUserResponse = match()
  .with('{ status: 200, user: { name:String, ...address } }', ({name, address}) => 
    `User name is ${name} and lives on ${formatAddress(address)}`)
  .else(() => 'No user found')
  .catch((e) => console.log('Error on getUserResponse', e))
  .end()
  
console.log(getUserResponse(/* user data from server maybe... */))

// About 9 lines of code
```

Did you notice the difference in terms of readability and maintainability? That's why pattern matching is awesome!

## Getting started
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [DSL](#dsl)

A good way to learn is by example. So the best kick off is [read the tests](./src), there are tons of them covering all the cases. Another source is the [examples](./examples) folder, especially the [tic-tac-toe](./examples/tic-tac-toe).

### Install
```sh
$ npm install match-ish --save
```

### Usage
Most basic usage:
```javascript
import { match } from 'match-ish';

// Create a new pattern matching function
const convertOneToString = match()
  .with('1', () => 'one')
  .end();

convertOneToString(1); // return 'one'
convertOneToString(2); // return undefined

// Create another one, but now since we are passing an
// argument the matching runs immediately.
const one = match(1)
  .with('1', () => 'one')
  .end();

one === 'one'; // true
```
Let's dig around in the library features and see what else we can do.

#### With
The `with()` functions are used to define patterns and callbacks:
```javascript
const myFunc = match()
  .with('1', () => 'one')
  
  // every bound variable is passed into an object 
  .with('x, 1', (boundVars) => 'X is ' + boundVars.x) 
  
  // using es6 destructuring, things looks much better
  .with('2, y', ({ y }) => `Y is ${y}`) 
  .end()

myFunc(2, 1); // === 'X is 2'
myFunc(1); // === 'one'
myFunc(2, 3); // === 'Y is 3'

```
The first argument is a string and always a string, under javascript's point of view. But it is not a simple string. Actually, this is a [DSL](#dsl) with which we can express the pattern easier than using a complicated data or function structures.

You can define patterns as much as you want. As you can notice in the example above when the first pattern matches the related callback is invoked. Then every variable is passed as an object member. So keep in mind that order is important.


#### Guards
Guards are a way to declare a condition. It is defined with `when()`:
```javascript
const myFunc = match()
  .with('x', ({x}) => `${x} is even`).when((x) => x % 2 === 0)
  .with('x', ({x}) => `${x} is odd`)
  .end()

myFunc(2); // === '2 is even'
myFunc(3); // === '3 is odd'

```
In this case, the pattern is exactly the same. But since there is guard `myFunc` returns different values.

Only one guard per pattern is allowed:
```javascript
const myFunc = match()
  .with('x, y', () => 'are equal').when((x, y) => x === y)
  .with('x, y', () => 'x > y').when((x, y) => x > y)
  .with('x, y', () => 'x < y').when((x, y) => x < y)

  .with('x, y', () => 'wrong')
    .when((x, y) => !!x)
    .when((x, y) => !!y)  // more than one when() throws an error

  .with('x, y', (() => `${x}, ${y}`))
  .end()

```

#### Do
Alternatively, you can define the callback using the `do()`:
```javascript
const myFunc = match()
  // Common (and recommended) syntax
  // with(<pattern>, <callback>).when(condition)
  .with('x, y', () => 'x < y').when((x, y) => x < y)
  
  // `do` syntax
  // with(<pattern>).do(<callback>).when(condition)
  .with('x, y').do(() => 'x > y').when((x, y) => x > y)
  
  // `when` and `do` inverted
  // with(<pattern>).when(condition).do(<callback>)
  .with('x, y').when((x, y) => x > y).do(() => 'x > y')
  
  // Or even you can use only `with`
  // with(<pattern>, <callback>, <condition>)
  .with('x, y', () => 'are equal', (x, y) => x === y)
  .end()

```

#### Else
If there is no match, the default return is `undefined`:
```javascript
const myFunc = match()
  .with('1', () => 'one')
  .end()

myFunc(3) // === undefined

```
But you can use an `else()`, then you'll be able to handle no matching or default cases.
```javascript
const myFunc = match()
  .with('1', () => 'one')
  .with('2', () => 'two')
  .else(() => 'I give up gracefully')
  .end()

myFunc(1) // === 'one'
myFunc(3) // === 'I give up'

```

#### Catch
Sometimes our callbacks may throw an error for some reason. Because of that, they are wrapped into a try..catch.
```javascript
const myFunc = match()
  .with('true', () => JSON.parse('wrong json syntax'))
  .end();

myFunc(true) // === Match error: SyntaxError: JSON.parse [...]
```
Using a the `catch()` you can define a function to handle this cases for a better response or some kind of recovery strategy.
```javascript
const myFunc = match()
  .with('true', () => JSON.parse('wrong json syntax'))
  .catch((e) => 'Oh! No! Not again.')
  .end();

myFunc(true) // === 'Oh! No! Not again.'
```

#### Nesting
You can achieve nesting matching by simply creating a new pattern match inside the callback:
```javascript
const myFunc = match()
  .with('0', () => 'is zero')
  .with('_, x', ({x}) => match(x)
    .with('y', () => 'Y is even').when((y) => y % 2 === 0)
    .with('y', () => 'Y is odd')
    .end())
  .end();

myFunc(2, 2) // Y is even
```

### DSL
So far, we covered how to use the Match-ish functions. Now, let talk about what makes Match-ish shines. As discussed above, the first argument of the `with()` function is not really a string. It is [Domain Specific Language](https://en.wikipedia.org/wiki/Domain-specific_language), designed to make patterns definitions easier.  [Other libraries](#other-nice-projects-and-initiatives) have different approaches like object schemas or extending the language with macros _(love macros BTW)_. But for sake of expressiveness and simplicity Match-ish use a really simple and straightforward declarative language. Right below, you'll find out everything you need to start using it.

#### Literal
The literal pattern is used when an equal match is expected.
```javascript
.with('1')        // Numbers
.with('"string"') // String
.with('true')     // Boolean
.with('{ a: 1 }') // Objects
.with('[ 1, 2 ]') // Arrays
.with('{}')       // empty Objects
.with('[]')       // empty Arrays

.with('1, 2, 3')  // sequence of values  
.with('true, "text", { a: 1 }, [true, true]') // sequence of mixed values
```
#### Bind
The bind pattern assigns the matched value to a variable. Naming variables can be done by lowercase letters only.
```javascript
// Bind any value to variable 'x'
.with('x')

// Bind the second value to variable 'x'
.with('1, x')

// Bind any values from the sequence respectively 
// to the variables 'a', 'b' and 'c'
.with('a, b, c')

// Bind the second item of an array to the variable 'second'
.with('[1, second]')

// Bind any value of the property b from an object
// to the variable 'myvar'
.with('{ a: 1, b: myvar')
```
#### Wildcard
This pattern would match anything, then it is ignored.
```javascript
.with('_')      
.with('_, 2')   
.with('[2, _]') 
.with('{ a: 1, b: _ }') 

// Example of wildcard as final match
.with('0', () => 'zero')
.with('1', () => 'one')
.with('_', () => 'not binary')

// But remember, order is important
.with('_', () => 'not binary') // every value would match
.with('0', () => 'zero')       // unreachable
.with('1', () => 'one')        // unreachable


```
#### Typed
It is possible to use types in order to qualify the values.
```javascript
// Bind only string type value to the variable 'x'
.with('x:String')        

// Match any value that is a Number type
.with('Number')          

// Bind the value of the property 'b' to
// the variable 'myvar', if it is a string
.with('{ a: Number, b: myvar:String }')

// Match an array where every item is a string
.with('[...]:String')    

```

#### Range
This pattern can match a range of values.
```javascript
.with('1..5')        // A range of numbers from 1 to 5
.with('1..5, 10')    // Numbers
.with('a..z')        // A range of chars from a to z
.with('A..Z')        // A range of chars from A to Z
.with('A..z')        // A range of chars from A to z, so something like (A, B, C ... Z, a, b, c ... z)
```

#### Rest
The rest pattern, is very similar to the rest operator of Javascript. 
```javascript
// Match an object with the property 'a' equal to 1 then
// capture the rest of the properties and assign to the variable 'others'.
// e.g.: given { a: 1, b: 2: c: 3 } then others === { b: 2, c: 3 }
.with('{ a: 1, ...others}')     

// Split an array by assigning the first item to the variable 'head'
// and the rest of the list to the variable 'tail'
.with('[ head, ...tail]')       

// Again, split an array binding the first two values
// but now, the rest of the list is ignored
.with('[ first, second, ...]')
.with('[ a, b, c, ...dtoy, z]') // Numbers

// Match an array with one or more items
.with('[ ... ]')

// Match an object with one or more items
.with('{ ... }')
```
#### Logical Or
With the operator `|` you can combine multiple patterns in order to match one of them.
```javascript
.with('2 | 4 ')
.with('1, _ | 2, _ ')
```
#### Logical And
With the operator `&` you can combine multiple patterns in order to match all of them.
```javascript
.with('2, x & _, 4')
.with('0, 0 & _, 0 & _, 0', )
```
#### As
Capture all the bound values then assign them to another variable.
```javascript
// Given { 1, 2, 3 } then { x: 1, y: 2, z: 3, all: {x: 1, y: 2, z: 3} }
.with('x, y, z as all')        // Numbers
```

### API
#### `match(value?: any)`
Start pattern match definition.
#### `with(pattern: String, callback?: Function, guard?: Function)`
Define a patten
#### `when(pattern: String)`
Define a guard
#### `do(callback: Function)`
Define a callback
#### `else(callback: Function)`
Define a callback if no pattern maches
#### `catch(errorHandler: Function)`
Define a callback if exception is throwed from callbacks
#### `end()`
Finish pattern match declaration chain.

## Development

### Running tests
```sh
$ npm test
```

### Linter
```sh
$ npm run lint  
```

### Built with
- [PEG.js](https://pegjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Jest](https://facebook.github.io/jest/)
- [Rollup](https://rollupjs.org/)
- [Yarn](https://yarnpkg.com/en/)

## References about Pattern Matching and DSL
- https://en.wikipedia.org/wiki/Domain-specific_language
- https://en.wikipedia.org/wiki/Pattern_matching
- https://fsharpforfunandprofit.com/posts/match-expression/
- https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/pattern-matching
- https://en.wikibooks.org/wiki/F_Sharp_Programming/Pattern_Matching_Basics#Using_Guards_within_Patterns
- https://en.wikibooks.org/wiki/Haskell/Pattern_matching
- http://learnyousomeerlang.com/syntax-in-functions

## Other nice projects and initiatives
- [ECMAScript Pattern Matching Syntax - Stage 0 Proposal](https://github.com/tc39/proposal-pattern-matching)
- [Pat-Mat](https://github.com/HerringtonDarkholme/Pat-Mat) - Coffeescript flavored pattern-matching lib.
- [sparkler](https://github.com/natefaubion/sparkler) - library that implements pattern matching with a custom language level syntax using macros with [sweet.js](https://github.com/sweet-js/sweet-core).
- [funcy](https://github.com/bramstein/funcy)
- [match-when](https://github.com/FGRibreau/match-when)
- [Z-pattern-matching](https://github.com/z-pattern-matching/z)

## Contributing
- Improving or correcting the documentation.
- Translating.
- Finding bugs
- Sharing this project.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog
See [CHANGELOG](CHANGELOG.md) file for details.