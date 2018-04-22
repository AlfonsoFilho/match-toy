# [![Match-Toy](https://match-toy.github.io/assets/match-toy-logo.svg)](https://match-toy.github.io)



[![Build Status](https://travis-ci.org/match-toy/match-toy.svg?branch=master)](https://travis-ci.org/match-toy/match-toy)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b4ef038eea888a8a8cfb/test_coverage)](https://codeclimate.com/github/match-toy/match-toy/test_coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/match-toy/match-toy.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/match-toy.svg)](https://badge.fury.io/js/match-toy)
[![Try match-toy on RunKit](https://badge.runkitcdn.com/match-toy.svg)](https://npm.runkit.com/match-toy)
> The pattern matching library for javascript.

[Match-Toy](https://match-toy.github.io) is a pattern matching library for javascript with a powerful DSL and support for a wide range of patterns. The best kick off is [read the tests](./src), there are tons of them covering all the cases. For complete documentation, please check out the [wiki](https://github.com/match-toy/match-toy/wiki). Another way is by examples:
- [Tic-tac-toe](https://match-toy.github.io/tic-tac-toe)
- [Other examples](./examples)

[Try it now](https://npm.runkit.com/match-toy).


## Installation
#### From NPM
```sh
$ npm install match-toy --save
```
Or yarn:
```sh
$ yarn add match-toy
```
Then import/require the module.
```javascript
const { match } = require('match-toy');
// or
import { match } from 'match-toy';
```

#### From CDN
Place the snippet into your html:
```html
<script src="https://cdn.jsdelivr.net/npm/match-toy/dist/bundle/index.min.js"></script>
```
For specific version append the desired version (on the format `@x.x.x`) before the word `match-toy` just like this:   `https://cdn.jsdelivr.net/npm/match-toy@2.0.1/dist/bundle/index.min.js`.

This file is a bundle in the [UMD](https://github.com/umdjs/umd) format. In browser's environments, the module name is in camelcase and available on `window` scope.
```javascript
var myFunc = matchToy.match()
                      .case('1', () => 'one')
                      .end()
```

See more in [examples](./examples).

## Usage
Most basic usage:
```javascript
import { match } from 'match-toy';

// Create a new pattern matching function
const convertOneToString = match()
  .case('1', () => 'one')
  .end();

convertOneToString(1); // return 'one'
convertOneToString(2); // return undefined

// Create another one, but now we only need
// the value returned by the match
const one = match()
  .case('1', () => 'one')
  .return(1); // using `return()` match runs immediately

one === 'one'; // true
```
See more about [usage](https://github.com/match-toy/match-toy/wiki/Usage) in depth.

### Built with
- [PEG.js](https://pegjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Jest](https://facebook.github.io/jest/)
- [Rollup](https://rollupjs.org/)
- [Yarn](https://yarnpkg.com/en/)
- [Testcheck-js](https://github.com/leebyron/testcheck-js)

## Other nice projects and initiatives
Syntax proposals:
- https://github.com/tc39/proposal-pattern-matching
- https://github.com/eborden/JS-Pattern-Matching
- https://gist.github.com/bterlson/da8f02b95b484cd4f8d9

Other JavaScript libraries:
- https://codemix.github.io/flow-runtime/#/docs/pattern-matching
- https://github.com/HerringtonDarkholme/Pat-Mat
- https://github.com/natefaubion/sparkler
- https://github.com/bramstein/funcy
- https://github.com/FGRibreau/match-when
- https://github.com/z-pattern-matching/z
- https://github.com/dherman/pattern-match
- https://github.com/mcollina/bloomrun


## Contributing
- Improving or correcting the documentation.
- Translating.
- Finding bugs
- Sharing this project.
- PR are very welcome.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog
See [CHANGELOG](CHANGELOG.md) file for details.
