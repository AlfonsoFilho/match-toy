import { compile } from './compiler';
import { interpreter } from './interpreter';
import { AstType } from './types';

declare let check;
declare let gen;

// tslint:disable-next-line:no-var-requires
require('jasmine-check').install();

describe('Interpreter', () => {

  const FAIL = [ false, {} ];
  const SUCCESS = [ true, {} ];
  /**
   * Helper function
   *
   * In the context of these tests:
   *
   * run('1, x', [1, 1])
   *
   * is equivalent to:
   *
   * match(1, 2)
   *   .case('1, x', ({x}) => x)
   *   .end()
   *
   * @param code Pattern Match
   * @param input values
   */
  const run = (code, input) => interpreter(compile(code), input);

  describe('Literal pattern', () => {

    it('should match single numbers', () => {
      // case('1', () => 'code')
      expect(run('1', [1])).toEqual(SUCCESS);
    });

    it('should fail if number is equal', () => {
      // case('1', () => 'code')
      expect(run('1', [2])).toEqual(FAIL);
    });

    it('should fail if input is empty', () => {
      // case('1', () => 'code')
      expect(run('1', [])).toEqual(FAIL);
    });

    it('should not match if input length is different', () => {
      // case('1', () => 'code')
      expect(run('1', [1, 2])).toEqual(FAIL);
    });

    it('should match many numbers', () => {
      // case('1, 2', () => 'code')
      expect(run('1, 2', [1, 2])).toEqual(SUCCESS);
    });

    it('should match booleans', () => {
      // case('true', () => 'code')
      expect(run('true', [true])).toEqual(SUCCESS);
      expect(run('false', [false])).toEqual(SUCCESS);
      expect(run('false', [true])).toEqual(FAIL);
      expect(run('true', [false])).toEqual(FAIL);
    });

    it('should match string with single quotes', () => {
      // case('"text"', () => 'code')
      expect(run('"text"', ['text'])).toEqual(SUCCESS);
      expect(run('"wrong"', ['text'])).toEqual(FAIL);
    });

    it('should match string with doube quotes', () => {
      // case("'text'", () => 'code')
      // tslint:disable-next-line:quotemark
      expect(run("'text'", ['text'])).toEqual(SUCCESS);
      // tslint:disable-next-line:quotemark
      expect(run("'wrong'", ['text'])).toEqual(FAIL);
    });

    it('should match objects', () => {
      // case('{ one: 1, two: 2 }', () => 'code')
      expect(run('{ one: 1, two: 2 }', [{ one: 1, two: 2 }])).toEqual(SUCCESS);
      expect(run('{ one: 1, two: 2 }', [{ one: 1, wrong: 2 }])).toEqual(FAIL);
      expect(run('{ one: 1, two: 2 }', [{ one: 1, two: 2, three: 3 }])).toEqual(FAIL);
      expect(run('{ one: 1, two: 2 }', [{}])).toEqual(FAIL);
    });

    it('should match depth objects', () => {
      // case('{ one: { two: 2 } }', () => 'code')
      expect(run('{ one: { two: 2 } }', [{ one: { two: 2 } }])).toEqual(SUCCESS);
      expect(run('{ one: { two: 2 } }', [{ one: { two: 1 } }])).toEqual(FAIL);
      expect(run('{ one: { two: 2 } }', [{ one: { three: 2 } }])).toEqual(FAIL);
      expect(run('{ one: { two: 2 } }', [{ one: { three: { four: 4 } } }])).toEqual(FAIL);
    });

    it('should match arrays', () => {
      // case('[1, 2, 3]', () => 'code')
      expect(run('[1, 2, 3]', [[1, 2, 3]])).toEqual(SUCCESS);
      expect(run('[1, 2, 3]', [[3, 2, 1]])).toEqual(FAIL);
      expect(run('[1, 2, 3]', [[]])).toEqual(FAIL);
      expect(run('[1, 2, 3]', [[1]])).toEqual(FAIL);
      expect(run('[1, 2, 3]', [[1, 2, 3, 4]])).toEqual(FAIL);
    });

    it('should match depth arrays', () => {
      // case('[1, [1, 2], 3]', () => 'code')
      expect(run('[1, [1, 2], 3]', [[1, [1, 2], 3]])).toEqual(SUCCESS);
      expect(run('[1, [1, 2], 3]', [[1, [2, 2], 3]])).toEqual(FAIL);
      expect(run('[1, [1, 2], 3]', [[]])).toEqual(FAIL);
    });

    it('should match multiple types of literals', () => {
      // case('1, 2, { one: 1}, true, [ 1 ]', () => 'code')
      expect(run('1, 2, { one: 1}, true, [ 1 ]', [1, 2, { one: 1 }, true, [1]])).toEqual(SUCCESS);
    });

    it('should match multiple complex literal pattern', () => {
      // case('["a", [ { b: "true", c: { d: false }}], 0], "text"', () => 'code')
      expect(
        run('["a", [ { b: "true", c: { d: false }}], 0], "text"',
        [['a', [ { b: 'true', c: { d: false }}], 0], 'text'])).toEqual(SUCCESS);
    });

    describe('QuickCheck', () => {
      check.it('should match only the same value', gen.int, (x) => {
        if (x === 1) {
          expect(run('1', [x])).toEqual(SUCCESS);
        } else {
          expect(run('1', [x])).toEqual(FAIL);
        }
      });

      check.it.skip('should match strings', gen.asciiString, (str) => {
        console.log(str);
        const pattern = `"${str}"`;
        if (['"""', '""""', '"\\"', '"" "', '""!"', '" ""', '"\\ "', '"!""', '"\\!"'].includes(pattern)) {
          expect(() => {
            run(pattern, [str]);
          }).toThrowError();
        } else {
          expect(run(pattern, [str])).toEqual(SUCCESS);
        }
      });
    });
  });

  describe('Bind pattern', () => {

    it('should bind one value', () => {
      // case('x', ({x}) => 'code')
      expect(run('x', [1])).toEqual([true, { x: 1 }]);
    });

    it('should bind many values', () => {
      // case('x, y', ({x, y}) => 'code')
      expect(run('x, y', [1, 2])).toEqual([true, { x: 1, y: 2 }]);
    });

    it('should bind values and match constants', () => {
      // case('x, y, 1', ({x, y}) => 'code')
      expect(run('x, y, 1', [1, 2, 1])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('x, y, 1', [1, 2, 2])).toEqual(FAIL);
    });

    it('should bind from objects', () => {
      // case('{one: x, two: y}', ({x, y}) => 'code')
      expect(run('{one: x, two: y}', [{ one: 1, two: 2}])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('{one: x, two: y}', [{ one: 1, wrong: 2}])).toEqual(FAIL);
      expect(run('{one: x, two: y}', [{ one: 1, two: 2, three: 3}])).toEqual(FAIL);
      expect(run('{one: x, two: y}', [{ one: 1 }])).toEqual(FAIL);
    });

    it('should bind from objects with same key name', () => {
      // case('{ x, y }', ({x, y}) => 'code')
      expect(run('{ x, y }', [{ x: 1, y: 2}])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('{ x, y }', [{ x: 1, z: 2}])).toEqual(FAIL);
      expect(run('{ x, y }', [{ x: 1, y: 2, z: 3}])).toEqual(FAIL);
      expect(run('{ x, y }', [{ }])).toEqual(FAIL);
    });

    it('should bind from arrays', () => {
      // case('[ x, y ]', ({x, y}) => 'code')
      expect(run('[ x, y ]', [[1, 2]])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('[ x, y ]', [[1, 2, 3]])).toEqual(FAIL);
      expect(run('[ x, y ]', [[]])).toEqual(FAIL);
    });

    describe('QuickCheck', () => {
      check.it('should bind any value', gen.any, (y) => {
        expect(run('x', [y])).toEqual([true, { x: y}]);
      });

      check.it('should bind any value for multiple variables', gen.any, gen.any, (a, b) => {
        expect(run('x, y', [a, b])).toEqual([true, { x: a, y: b}]);
      });

      check.it('should bind values and match constants', gen.any, gen.any, (a, b) => {
        expect(run('x, y, 1', [a, b, 1])).toEqual([true, { x: a, y: b}]);
      });
    });
  });

  describe('Wildcard pattern', () => {

    it('should match simple wildcard', () => {
      // case('_', () => 'code')
      expect(run('_', [1])).toEqual(SUCCESS);
      expect(run('_', [])).toEqual(FAIL);
      expect(run('_', [1, 2])).toEqual(FAIL);
    });

    it('should match wildcard with constant', () => {
      // case('1, _', () => 'code')
      expect(run('1, _', [1, 1])).toEqual(SUCCESS);
      expect(run('1, _', [1])).toEqual(FAIL);
      expect(run('1, _', [1, 2, 3])).toEqual(FAIL);
      expect(run('1, _', [])).toEqual(FAIL);
    });

    it('should match wildcard inside of an object', () => {
      // case('{ a: 1, b: _, c: 1 }', () => 'code')
      expect(run('{ a: 1, b: _, c: 1 }', [{a: 1, b: '_', c: 1}])).toEqual(SUCCESS);
    });

    it('should match wildcard inside of an array', () => {
      // case('[1, _, 1]', () => 'code')
      expect(run('[1, _, 1]', [[1, 1, 1]])).toEqual(SUCCESS);
      expect(run('[1, _, 1]', [[1, 1]])).toEqual(FAIL);
    });
  });

  describe('Object pattern', () => {

    it('should match empty objects', () => {
      // case('{}', () => 'code')
      expect(run('{}', [{}])).toEqual(SUCCESS);
      expect(run('{}', [{a: 1}])).toEqual(FAIL);
    });

    it('should match objects regardless order', () => {
      // case('{ a: 1, b: 2 }', () => 'code')
      expect(run('{ a: 1, b: 2 }', [{ a: 1, b: 2 }])).toEqual(SUCCESS);
      expect(run('{ a: 1, b: 2 }', [{ b: 2, a: 1 }])).toEqual(SUCCESS);
    });
    
    it('should match destructuring objects', () => {
      // case('{ a: 1, ...tail }', ({ tail }) => 'code')
      expect(run('{ a: 1, ...tail }', [{ a: 1, c: 3, b: 2}])).toEqual([ true, {tail: {b:2, c:3}} ]);
      expect(run('{ a: 1, ... }', [{ a: 1, c: 3, b: 2}])).toEqual(SUCCESS);
      expect(run('{...}', [{ a: 1, c: 3, b: 2}])).toEqual(SUCCESS);
      expect(run('{...}', [{}])).toEqual(FAIL);
      expect(run('{ a: 1, ...bc, d: x }', [{ a: 1, b: 2, c: 3, d: 4}])).toEqual([ true, {x: 4, bc: {b:2, c:3}} ]);
      expect(run('{ a: 1, ...bc, d: 4 }', [{ a: 1, b: 2, c: 3, d: 4}])).toEqual([ true, {bc: {b:2, c:3}} ]);
      expect(run('{ a: 1, ...bc, d: 4 }', [{ a: 1, b: 2, c: 3}])).toEqual(FAIL);
    });
  });

  describe.only('List/Array pattern',  () => {

    it('should match empty list', () => {
      // case('[]', () => 'code')
      expect(run('[]', [[]])).toEqual(SUCCESS);
      expect(run('[]', [['one']])).toEqual(FAIL);
    });

    it('should match destructuring arrays', () => {
      // case('[1, ...tail]', ({ tail }) => 'code')
      expect(run('[ 1, ...tail ]', [[ 1, 2, 3 ]])).toEqual([ true, {tail: [2, 3]} ]);
      expect(run('[ 1, ... ]', [[ 1, 2, 3 ]])).toEqual(SUCCESS);
      expect(run('[ 1, ... ]', [[ 1 ]])).toEqual(FAIL);
      expect(run('[ ...all ]', [[ 1, 2, 3 ]])).toEqual([ true, {all: [1, 2, 3]} ]);
      expect(run('[ ... ]', [[ 1, 2, 3 ]])).toEqual(SUCCESS);
      expect(run('[ ... ]', [[ 1 ]])).toEqual(SUCCESS);
      expect(run('[ ... ]', [[]])).toEqual(FAIL);
      expect(run('[ head, ...tail ]', [[1, 2, 3]])).toEqual([ true, {head: 1, tail: [2, 3]}]);
      expect(run('[ a, b, c, ...xs ]', [[1, 2, 3, 4, 5]])).toEqual([ true, {a: 1, b: 2, c: 3, xs: [4, 5]}]);
      expect(run('[ a, ...btox, y, z ]', [[1, 2, 3, 4, 5]])).toEqual([ true, {a: 1, btox: [2, 3], y: 4, z: 5}]);
    });
  });

  describe.skip('Mapping pattern', () => {

    it('should filter and desconstruct an array', () => {
      pattern = compile('[...characters({ name: hero, type: "hero", ... })]');

      expect(interpreter(pattern, [[
        { name: 'Spiderman', alterEgo: 'Peter Parker', type: 'hero' },
        { name: 'IronMan', alterEgo: 'Tony Stark', type: 'hero' },
        { name: 'Doctor Doom', alterEgo: 'Victor Von Doom', type: 'villain' },
        { name: 'Venom', alterEgo: 'Eddie Brock', type: 'villain' }
      ]])).toEqual([true, {characters: [
        { hero: 'Spiderman' },
        { hero: 'IronMan' }
      ]}]);
    });

    it('should filter and desconstruct an array with specific schema', () => {
      pattern = compile('[...characters({ name: hero, type: "hero"})]');

      expect(interpreter(pattern, [[
        { name: 'Spiderman', type: 'hero' },
        { name: 'IronMan', type: 'hero' },
        { name: 'Doctor Doom', type: 'villain' },
        { name: 'Venom', type: 'villain' }
      ]])).toEqual([true, {characters: [
        { hero: 'Spiderman' },
        { hero: 'IronMan' }
      ]}]);

      expect(interpreter(pattern, [[
        { name: 'Spiderman', alterEgo: 'Peter Parker', type: 'hero' },
        { name: 'IronMan', alterEgo: 'Tony Stark', type: 'hero' },
        { name: 'Doctor Doom', alterEgo: 'Victor Von Doom', type: 'villain' },
        { name: 'Venom', alterEgo: 'Eddie Brock', type: 'villain' }
      ]])).toEqual(FAIL);
    });

    it('should redux', () => {
      pattern = compile('[...todos({ completed: true, text, id })], "SHOW_COMPLETED"');
      // pattern = compile('[...todos({ completed: true, ... } & { completed, text, id })], "SHOW_COMPLETED"');
      expect(interpreter(pattern, [[
        { id: 0, text: 'Peter Parker', completed: true },
        { id: 1, text: 'Mary Jane', completed: true },
        { id: 2, text: 'Norman Osborn', completed: false }
      ], 'SHOW_COMPLETED'])).toEqual([ true, {
          todos: [
            { id: 0, text: 'Peter Parker' },
            { id: 1, text: 'Mary Jane' }
            // { id: 0, text: 'Peter Parker', completed: true },
            // { id: 1, text: 'Mary Jane', completed: true }
          ]
        }
      ]);
    });

    it('should filter and desconstruct an object', () => {
      pattern = compile('{...characters({ alterEgo: name, type: "hero"})}');

      expect(interpreter(pattern, [{
        'Spiderman': {alterEgo: 'Peter Parker', type: 'hero' },
        'IronMan': { alterEgo: 'Tony Stark', type: 'hero' },
        'Doctor Doom': { alterEgo: 'Victor Von Doom', type: 'villain' },
        'Venom': { alterEgo: 'Eddie Brock', type: 'villain' }
      }])).toEqual([true, {characters: {
        Spiderman: { name: 'Peter Parker'},
        IronMan: { name: 'Tony Stark' }
      } }]);
    });
  });

  describe.skip('Range pattern', () => {
    describe('when matching a range of numbers', () => {
      beforeEach(() => {
        // with('0..10', () => void)
        pattern = compile('0..10');
      });

      it('should match', () => {
        expect(interpreter(pattern, [0])).toEqual([true, {}]);
        expect(interpreter(pattern, [5])).toEqual([true, {}]);
        expect(interpreter(pattern, [10])).toEqual([true, {}]);
      });

      it('should not match if input is out of range', () => {
        expect(interpreter(pattern, [-3])).toEqual(FAIL);
        expect(interpreter(pattern, [11])).toEqual(FAIL);
      });

      it('should not match if input is not a number', () => {
        expect(interpreter(pattern, ['1'])).toEqual(FAIL);
        expect(interpreter(pattern, ['x'])).toEqual(FAIL);
        expect(interpreter(pattern, [true])).toEqual(FAIL);
      });
    });

    describe('when matching a range of chars', () => {
      beforeEach(() => {
        // with('a..f', () => void)
        pattern = compile('a..f');
      });

      it('should match', () => {
        expect(interpreter(pattern, ['a'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['c'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['f'])).toEqual([true, {}]);
      });

      it('should not match if input is out of range', () => {
        expect(interpreter(pattern, ['A'])).toEqual(FAIL);
        expect(interpreter(pattern, ['g'])).toEqual(FAIL);
      });

      it('should not match if input is not a char', () => {
        expect(interpreter(pattern, [1])).toEqual(FAIL);
        expect(interpreter(pattern, [true])).toEqual(FAIL);
      });
    });

    describe('when matching a range of uppercase chars', () => {
      beforeEach(() => {
        // with('a..f', () => void)
        pattern = compile('A..F');
      });

      it('should match', () => {
        expect(interpreter(pattern, ['A'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['C'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['F'])).toEqual([true, {}]);
      });

      it('should not match if input is out of range', () => {
        expect(interpreter(pattern, ['G'])).toEqual(FAIL);
        expect(interpreter(pattern, ['c'])).toEqual(FAIL);
      });

      it('should not match if input is not a char', () => {
        expect(interpreter(pattern, [1])).toEqual(FAIL);
        expect(interpreter(pattern, [true])).toEqual(FAIL);
      });
    });

    describe('when matching a range of mix chars', () => {
      beforeEach(() => {
        // with('A..f', () => void)
        pattern = compile('A..f');
      });

      it('should match', () => {
        expect(interpreter(pattern, ['A'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['C'])).toEqual([true, {}]);
        expect(interpreter(pattern, ['c'])).toEqual([true, {}]);
      });

      it('should not match if input is out of range', () => {
        expect(interpreter(pattern, ['g'])).toEqual(FAIL);
        expect(interpreter(pattern, ['h'])).toEqual(FAIL);
      });

      it('should not match if input is not a char', () => {
        expect(interpreter(pattern, [1])).toEqual(FAIL);
        expect(interpreter(pattern, [true])).toEqual(FAIL);
      });
    });
  });

  describe.skip('Logical pattern', () => {
    describe('Logical Or pattern', () => {
      describe('when matching one of the patterns', () => {
        beforeEach(() => {
          // with('2 | "two"', () => 'equal to two')
          pattern = compile('2 | "two"');
        });

        it('should match', () => {
          expect(interpreter(pattern, [2])).toEqual([true, {}]);
          expect(interpreter(pattern, ['two'])).toEqual([true, {}]);
        });

        it('should not match', () => {
          expect(interpreter(pattern, [4])).toEqual(FAIL);
          expect(interpreter(pattern, [2, 1])).toEqual(FAIL);
        });
      });

      describe('when matching with bind patterns', () => {
        beforeEach(() => {
          // with('2 | "two", x', () => 'equal to two')
          pattern = compile('2 | "two", x');
        });

        it('should match', () => {
          expect(interpreter(pattern, [2])).toEqual([true, {}]);
          expect(interpreter(pattern, ['two', 3])).toEqual([true, { x: 3 }]);
        });

        it('should not match', () => {
          expect(interpreter(pattern, [4])).toEqual(FAIL);
          expect(interpreter(pattern, [2, 1])).toEqual(FAIL);
          expect(interpreter(pattern, ['two', 3, 2])).toEqual(FAIL);
        });
      });

      describe('when matching nesting OR patterns', () => {
        beforeEach(() => {
          // with('1 | 2 | 3', () => 'equal to two')
          pattern = compile('1 | 2 | 3');
        });

        it('should match', () => {
          expect(interpreter(pattern, [1])).toEqual([true, {}]);
          expect(interpreter(pattern, [2])).toEqual([true, {}]);
          expect(interpreter(pattern, [3])).toEqual([true, {}]);
        });

        it('should not match', () => {
          expect(interpreter(pattern, [4])).toEqual(FAIL);
        });
      });

    });

    describe('Logical And pattern', () => {
      describe('when matching all the patterns', () => {
        beforeEach(() => {
          // with('2, x & _, 1', () => 'equal to two')
          pattern = compile('2, x & _, 1');
        });

        it('should match', () => {
          expect(interpreter(pattern, [2, 1])).toEqual([true, { x: 1 }]);
        });

        it('should not match', () => {
          expect(interpreter(pattern, [2, 2])).toEqual(FAIL);
          expect(interpreter(pattern, [2])).toEqual(FAIL);
        });
      });

      describe('when matching nesting AND the patterns', () => {
        beforeEach(() => {
          // with('2, x, _ & _, 1, y & _, _, 3', () => 'equal to two')
          pattern = compile('2, x, _ & _, 1, y & _, _, 3');
        });

        it('should match', () => {
          expect(interpreter(pattern, [2, 1, 3])).toEqual([true, { x: 1, y: 3 }]);
        });

        it('should not match', () => {
          expect(interpreter(pattern, [1, 1, 1])).toEqual(FAIL);
          expect(interpreter(pattern, [2, 2])).toEqual(FAIL);
          expect(interpreter(pattern, [2])).toEqual(FAIL);
        });
      });
    });

    describe('Logical patters', () => {
      it('should match a combination fo and and or patterns', () => {
        pattern = compile('1, 2 | 4, 2 & _, x');
        expect(interpreter(pattern, [1, 2])).toEqual([true, {x: 2}]);
        expect(interpreter(pattern, [4, 2])).toEqual([true, {x: 2}]);
      });
    });
  });

  describe.skip('As pattern', () => {
    describe('should bind all input values ', () => {

      it('should match', () => {
        // with('x, y as z', ({x, y, z}) => "x = 1, y =2 z= {x:1, y:2}")
        pattern = compile('z@(x, y)');
        expect(interpreter(pattern, [1, 2])).toEqual([true, { x: 1, y: 2, z: [1, 2] }]);
      });

      it('should match', () => {
        // with('x, y as z', ({x, y, z}) => "x = 1, y =2 z= {x:1, y:2}")
        pattern = compile('z@(x, y), 2');
        expect(interpreter(pattern, [1, 2, 2])).toEqual([true, { x: 1, y: 2, z: [1, 2] }]);
        // expect(interpreter(pattern, [1, 2, 3])).toEqual(FAIL);
      });
    });
  });

  describe.skip('Type pattern', () => {

    describe('should match an primitive types', () => {

      it('should match if is Boolean', () => {
        // with('Boolean', () => 'code')
        // with('_:Boolean', () => 'code')
        pattern = compile('Boolean');
        expect(interpreter(pattern, [true])).toEqual([true, {}]);
        expect(interpreter(pattern, [false])).toEqual([true, {}]);
        expect(interpreter(pattern, ['true'])).toEqual(FAIL);
      });

      it('should match if is Number', () => {
        // with('Number', () => 'code')
        // with('_:Number', () => 'code')
        pattern = compile('Number');
        expect(interpreter(pattern, [1])).toEqual([true, {}]);
        expect(interpreter(pattern, ['1'])).toEqual(FAIL);
      });

      it('should match if is String', () => {
        // with('String', () => 'code')
        // with('_:String', () => 'code')
        pattern = compile('String');
        expect(interpreter(pattern, ['string'])).toEqual([true, {}]);
        expect(interpreter(pattern, [true])).toEqual(FAIL);
      });

      it('should match if is Undefined', () => {
        // with('Undefined', () => 'code')
        // with('_:Undefined', () => 'code')
        pattern = compile('Undefined');
        expect(interpreter(pattern, [undefined])).toEqual([true, {}]);
      });

      it('should match if is Null', () => {
        // with('Null', () => 'code')
        // with('_:Null', () => 'code')
        pattern = compile('Null');
        expect(interpreter(pattern, [null])).toEqual([true, {}]);
      });

      it('should match if is Array', () => {
        // with('Array', () => 'code')
        // with('_:Array', () => 'code')
        pattern = compile('Array');
        expect(interpreter(pattern, [[1]])).toEqual([true, {}]);
      });

      it('should match if is Object', () => {
        // with('Object', () => 'code')
        // with('_:Object', () => 'code')
        pattern = compile('Object');
        expect(interpreter(pattern, [{}])).toEqual([true, {}]);
      });

      it('should match if is Function', () => {
        // with('Function', () => 'code')
        // with('_:Function', () => 'code')
        pattern = compile('Function');
        expect(interpreter(pattern, [() => {/**/}])).toEqual([true, {}]);
      });

      it('should match if is RegExp', () => {
        // with('RegExp', () => 'code')
        // with('_:RegExp', () => 'code')
        pattern = compile('RegExp');
        expect(interpreter(pattern, [/a-z/])).toEqual([true, {}]);
      });

      it('should match if is Date', () => {
        // with('Date', () => 'code')
        // with('_:Date', () => 'code')
        pattern = compile('Date');
        expect(interpreter(pattern, [new Date()])).toEqual([true, {}]);
      });

      it('should match if is Nullable', () => {
        // with('Nullable', () => 'code')
        // with('_:Nullable', () => 'code')
        pattern = compile('Nullable');
        expect(interpreter(pattern, [{}])).toEqual([true, {}]);
        expect(interpreter(pattern, [[]])).toEqual([true, {}]);
        expect(interpreter(pattern, [''])).toEqual([true, {}]);
        expect(interpreter(pattern, [0])).toEqual([true, {}]);
        expect(interpreter(pattern, [undefined])).toEqual([true, {}]);
        expect(interpreter(pattern, [null])).toEqual([true, {}]);
      });
    });

    describe('should match types and bind', () => {
      beforeEach(() => {
        // with('x:Boolean, y:Object', ({x, y}) => 'code')
        pattern = compile('x:Boolean, y:Object');
      });

      it('should match', () => {
        expect(interpreter(pattern, [true, {one: 1}])).toEqual([true, { x: true, y: { one: 1 } }]);
      });

      it('should not match', () => {
        expect(interpreter(pattern, ['true', {one: 1}])).toEqual(FAIL);
      });
    });
    describe('should match list of types', () => {
      beforeEach(() => {
        // with('[...]:Number', (list) => list === [['A', 1], ['A', 2]])
        pattern = compile('[...]:Number');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual([true, {}]);
      });

      it('should not match', () => {
        expect(interpreter(pattern, [[1, '2', true]])).toEqual(FAIL);
      });
    });

    describe('should match an instanceof', () => {
      function Color() {/**/}
      const red = new Color();
      beforeEach(() => {
        // with('Color', () => 'code')
        pattern = compile('Color');
      });

      it('should match', () => {
        expect(interpreter(pattern, [red])).toEqual([true, {}]);
      });

      it('should not match', () => {
        expect(interpreter(pattern, [1])).toEqual(FAIL);
      });
    });

    describe('Regex Pattern', () => {
      it('should match', () => {
        pattern = compile('/^http/');
        expect(JSON.stringify(interpreter(pattern, ['http://www.google.com'])))
          .toEqual(JSON.stringify([true, { result: ['http'] }]));
      });

      it('should not match', () => {
        pattern = compile('/^http/');
        expect(JSON.stringify(interpreter(pattern, ['www.google.com'])))
          .toEqual(JSON.stringify(FAIL));
      });
    });
  });

  describe.skip('Errors', () => {
    it('should throw a error with a friendly message', () => {
      expect(() => {
        compile('1x');
      }).toThrowError(expect.stringMatching('Match-ish Syntax Error'));
    });
  });
  describe.skip('Doc Examples', () => {});
});
