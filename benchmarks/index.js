const { Suite } = require('benchmark');
const benchmarks = require('beautify-benchmark');
const match = require('../dist/bundle/index.min.js')

const suite = new Suite;

// add tests
suite.add('RegExp#test', function () {
  /o/.test('Hello World!');
})
  .add('String#indexOf', function () {
    'Hello World!'.indexOf('o') > -1;
  })
  // add listeners
  .on('cycle', function (event) {
    benchmarks.add(event.target);
  })
  .on('complete', function () {
    benchmarks.log()
    // console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ 'async': true });

