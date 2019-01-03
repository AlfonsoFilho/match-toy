import { gen, sample, sampleOne } from 'testcheck';
import { compile } from '../compiler';
import { FAIL, SUCCESS } from '../constants';
import { interpreter } from '../interpreter';
import { AstType } from '../types';

declare let check;

// tslint:disable-next-line:no-var-requires
require('jasmine-check').install();

describe('Interpreter', () => {
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

    it('should fail if number is not equal', () => {
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

    it('should match NaN', () => {
      // case('NaN', () => 'code')
      expect(run('NaN', [NaN])).toEqual(SUCCESS);
      expect(run('NaN', [1])).toEqual(FAIL);
    });

    it('should match Infinity', () => {
      // case('Infinity', () => 'code')
      expect(run('Infinity', [Infinity])).toEqual(SUCCESS);
      expect(run('Infinity', [1])).toEqual(FAIL);
    });

    check.it(
      'should match a random sort of number patterns',
      gen.array(gen.number).notEmpty(),
      x => {
        const pattern = x.join(', ');
        expect(run(pattern, x)).toEqual(SUCCESS);
      }
    );

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
      expect(run('""', [''])).toEqual(SUCCESS);
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
        run('["a", [ { b: "true", c: { d: false }}], 0], "text"', [
          ['a', [{ b: 'true', c: { d: false } }], 0],
          'text'
        ])
      ).toEqual(SUCCESS);
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
      expect(run('{one: x, two: y}', [{ one: 1, two: 2 }])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('{one: x, two: y}', [{ one: 1, wrong: 2 }])).toEqual(FAIL);
      expect(run('{one: x, two: y}', [{ one: 1, two: 2, three: 3 }])).toEqual(FAIL);
      expect(run('{one: x, two: y}', [{ one: 1 }])).toEqual(FAIL);
    });

    it('should bind from objects with same key name', () => {
      // case('{ x, y }', ({x, y}) => 'code')
      expect(run('{ x, y }', [{ x: 1, y: 2 }])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('{ x, y }', [{ x: 1, z: 2 }])).toEqual(FAIL);
      expect(run('{ x, y }', [{ x: 1, y: 2, z: 3 }])).toEqual(FAIL);
      expect(run('{ x, y }', [{}])).toEqual(FAIL);
    });

    it('should bind from arrays', () => {
      // case('[ x, y ]', ({x, y}) => 'code')
      expect(run('[ x, y ]', [[1, 2]])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('[ x, y ]', [[1, 2, 3]])).toEqual(FAIL);
      expect(run('[ x, y ]', [[]])).toEqual(FAIL);
    });

    describe('QuickCheck', () => {
      check.it('should bind any value', gen.any, y => {
        expect(run('x', [y])).toEqual([true, { x: y }]);
      });

      check.it('should bind any value for multiple variables', gen.any, gen.any, (a, b) => {
        expect(run('x, y', [a, b])).toEqual([true, { x: a, y: b }]);
      });

      check.it('should bind values and match constants', gen.any, gen.any, (a, b) => {
        expect(run('x, y, 1', [a, b, 1])).toEqual([true, { x: a, y: b }]);
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
      expect(run('{ a: 1, b: _, c: 1 }', [{ a: 1, b: '_', c: 1 }])).toEqual(SUCCESS);
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
      expect(run('{}', [{ a: 1 }])).toEqual(FAIL);
    });

    it('should match objects regardless order', () => {
      // case('{ a: 1, b: 2 }', () => 'code')
      expect(run('{ a: 1, b: 2 }', [{ a: 1, b: 2 }])).toEqual(SUCCESS);
      expect(run('{ a: 1, b: 2 }', [{ b: 2, a: 1 }])).toEqual(SUCCESS);
    });

    it('should match destructuring objects', () => {
      // case('{ a: 1, ...tail }', ({ tail }) => 'code')
      expect(run('{ a: 1, ...tail }', [{ a: 1, c: 3, b: 2 }])).toEqual([
        true,
        { tail: { b: 2, c: 3 } }
      ]);
      expect(run('{ a: 1, ... }', [{ a: 1, c: 3, b: 2 }])).toEqual(SUCCESS);
      expect(run('{...}', [{ a: 1, c: 3, b: 2 }])).toEqual(SUCCESS);
      expect(run('{...}', [{}])).toEqual(FAIL);
      expect(run('{ a: 1, ...bc, d: x }', [{ a: 1, b: 2, c: 3, d: 4 }])).toEqual([
        true,
        { x: 4, bc: { b: 2, c: 3 } }
      ]);
      expect(run('{ a: 1, ...bc, d: 4 }', [{ a: 1, b: 2, c: 3, d: 4 }])).toEqual([
        true,
        { bc: { b: 2, c: 3 } }
      ]);
      expect(run('{ a: 1, ...bc, d: 4 }', [{ a: 1, b: 2, c: 3 }])).toEqual(FAIL);
    });
  });

  describe('List/Array pattern', () => {
    it('should match empty list', () => {
      // case('[]', () => 'code')
      expect(run('[]', [[]])).toEqual(SUCCESS);
      expect(run('[]', [['one']])).toEqual(FAIL);
    });

    it('should match destructuring arrays', () => {
      // case('[1, ...tail]', ({ tail }) => 'code')
      expect(run('[ 1, ...tail ]', [[1, 2, 3]])).toEqual([true, { tail: [2, 3] }]);
      expect(run('[ 1, ... ]', [[1, 2, 3]])).toEqual(SUCCESS);
      expect(run('[ 1, ... ]', [[1]])).toEqual(FAIL);
      expect(run('[ ...all ]', [[1, 2, 3]])).toEqual([true, { all: [1, 2, 3] }]);
      expect(run('[ ... ]', [[1, 2, 3]])).toEqual(SUCCESS);
      expect(run('[ ... ]', [[1]])).toEqual(SUCCESS);
      expect(run('[ ... ]', [[]])).toEqual(FAIL);
      expect(run('[ head, ...tail ]', [[1, 2, 3]])).toEqual([true, { head: 1, tail: [2, 3] }]);
      expect(run('[ a, b, c, ...xs ]', [[1, 2, 3, 4, 5]])).toEqual([
        true,
        { a: 1, b: 2, c: 3, xs: [4, 5] }
      ]);
      expect(run('[ a, ...btox, y, z ]', [[1, 2, 3, 4, 5]])).toEqual([
        true,
        { a: 1, btox: [2, 3], y: 4, z: 5 }
      ]);
    });
  });

  describe('Mapping pattern', () => {
    it('should filter and desconstruct an array', () => {
      expect(
        run('[...characters({ name: hero, type: "hero", ... })]', [
          [
            { name: 'Spiderman', alterEgo: 'Peter Parker', type: 'hero' },
            { name: 'IronMan', alterEgo: 'Tony Stark', type: 'hero' },
            { name: 'Doctor Doom', alterEgo: 'Victor Von Doom', type: 'villain' },
            { name: 'Venom', alterEgo: 'Eddie Brock', type: 'villain' }
          ]
        ])
      ).toEqual([true, { characters: [{ hero: 'Spiderman' }, { hero: 'IronMan' }] }]);
    });

    it('should filter and desconstruct an array with specific schema', () => {
      expect(
        run('[...characters({ name: hero, type: "hero"})]', [
          [
            { name: 'Spiderman', type: 'hero' },
            { name: 'IronMan', type: 'hero' },
            { name: 'Doctor Doom', type: 'villain' },
            { name: 'Venom', type: 'villain' }
          ]
        ])
      ).toEqual([true, { characters: [{ hero: 'Spiderman' }, { hero: 'IronMan' }] }]);

      expect(
        run('[...characters({ name: hero, type: "hero"})]', [
          [
            { name: 'Spiderman', alterEgo: 'Peter Parker', type: 'hero' },
            { name: 'IronMan', alterEgo: 'Tony Stark', type: 'hero' },
            { name: 'Doctor Doom', alterEgo: 'Victor Von Doom', type: 'villain' },
            { name: 'Venom', alterEgo: 'Eddie Brock', type: 'villain' }
          ]
        ])
      ).toEqual(FAIL);
    });

    it('should redux', () => {
      // pattern = compile('[...todos({ completed: true, ... } & { completed, text, id })], "SHOW_COMPLETED"');
      expect(
        run('[...todos({ completed@: true, text, id })], "SHOW_COMPLETED"', [
          [
            { id: 0, text: 'Peter Parker', completed: true },
            { id: 1, text: 'Mary Jane', completed: true },
            { id: 2, text: 'Norman Osborn', completed: false }
          ],
          'SHOW_COMPLETED'
        ])
      ).toEqual([
        true,
        {
          todos: [
            { id: 0, text: 'Peter Parker', completed: true },
            { id: 1, text: 'Mary Jane', completed: true }
          ]
        }
      ]);
    });

    it('should filter and desconstruct an object', () => {
      expect(
        run('{...characters({ alterEgo: name, type: "hero"})}', [
          {
            Spiderman: { alterEgo: 'Peter Parker', type: 'hero' },
            IronMan: { alterEgo: 'Tony Stark', type: 'hero' },
            'Doctor Doom': { alterEgo: 'Victor Von Doom', type: 'villain' },
            Venom: { alterEgo: 'Eddie Brock', type: 'villain' }
          }
        ])
      ).toEqual([
        true,
        {
          characters: {
            Spiderman: { name: 'Peter Parker' },
            IronMan: { name: 'Tony Stark' }
          }
        }
      ]);
    });
  });

  describe('Range pattern', () => {
    it('should match in a range of numbers', () => {
      // case('0..10', () => 'code')
      expect(run('0..10', [0])).toEqual(SUCCESS);
      expect(run('0..10', [5])).toEqual(SUCCESS);
      expect(run('0..10', [10])).toEqual(SUCCESS);
      expect(run('0..10', [-1])).toEqual(FAIL);
      expect(run('0..10', [11])).toEqual(FAIL);
      expect(run('0..10', [true])).toEqual(FAIL);
      expect(run('0..10', ['1'])).toEqual(FAIL);
    });

    it('should match in a range of chars', () => {
      // case('a..f', () => 'code')
      expect(run('a..f', ['a'])).toEqual(SUCCESS);
      expect(run('a..f', ['c'])).toEqual(SUCCESS);
      expect(run('a..f', ['A'])).toEqual(FAIL);
      expect(run('A..F', ['A'])).toEqual(SUCCESS);
      expect(run('A..F', ['a'])).toEqual(FAIL);
      expect(run('a..f', [1])).toEqual(FAIL);
      expect(run('a..f', [true])).toEqual(FAIL);
    });

    describe('QuickCheck', () => {
      check.it(
        'should match in a range of numbers',
        gen.number,
        gen.int,
        gen.int,
        (x, start, end) => {
          if (x >= start && x <= end) {
            expect(run(`${start}..${end}`, [x])).toEqual(SUCCESS);
          } else {
            expect(run(`${start}..${end}`, [x])).toEqual(FAIL);
          }
        }
      );

      check.it('should match in a range of chars', gen.char, 'a', 'z', (x, start, end) => {
        if (x >= start && x <= end) {
          expect(run(`${start}..${end}`, [x])).toEqual(SUCCESS);
        } else {
          expect(run(`${start}..${end}`, [x])).toEqual(FAIL);
        }
      });
    });
  });

  describe('Regex Pattern', () => {
    it('should match regular expressions', () => {
      // case('/^http/', () => 'code')
      const toJson = JSON.stringify;
      expect(toJson(run('/^http/', ['http://www.google.com']))).toEqual(
        toJson([true, { result: ['http'] }])
      );
      expect(toJson(run('/^http/', ['www.google.com']))).toEqual(toJson(FAIL));
    });
  });

  describe('Logical pattern', () => {
    it('should match one of the two patterns (Or pattern)', () => {
      // case('1 | 'two', () => 'code')
      expect(run(' 1 | "two"', [1])).toEqual(SUCCESS);
      expect(run(' 1 | "two"', ['two'])).toEqual(SUCCESS);
      expect(run(' 1 | "two"', [4])).toEqual(FAIL);
      expect(run(' 1 | "two"', [1, 'two'])).toEqual(FAIL);
      expect(run(' 2 | "two", x', [2])).toEqual(SUCCESS);
      expect(run(' 2 | "two", x', ['two', 4])).toEqual([true, { x: 4 }]);
      expect(run(' 1 | 2 | 3', [1])).toEqual(SUCCESS);
      expect(run(' 1 | 2 | 3', [2])).toEqual(SUCCESS);
      expect(run(' 1 | 2 | 3', [3])).toEqual(SUCCESS);
      expect(run(' 1 | 2 | 3', [4])).toEqual(FAIL);
    });

    it('should match all patterns (And pattern)', () => {
      // case('2, x & _, 1', ({x}) => 'code')
      expect(run('2, x & _, 1', [2, 1])).toEqual([true, { x: 1 }]);
      expect(run('2, x & _, 1', [2, 2])).toEqual(FAIL);
      expect(run('2, x & _, 1', [2])).toEqual(FAIL);
      expect(run('2, x & _, 1', [2, 1, 0])).toEqual(FAIL);
      expect(run('2, x, _ & _, 1, y & _, _, 3', [2, 1, 3])).toEqual([true, { x: 1, y: 3 }]);
      expect(run('2, x, _ & _, 1, y & _, _, 3', [2, 1, 1])).toEqual(FAIL);
      expect(run('2, x, _ & _, 1, y & _, _, 3', [2, 1])).toEqual(FAIL);
    });

    it('should mix both logical patterns', () => {
      // case('1, 2 | 4, 2 & _, x', () => 'code')
      expect(run('1, 2 | 4, 2 & _, x', [1, 2])).toEqual([true, { x: 2 }]);
      expect(run('1, 2 | 4, 2 & _, x', [4, 2])).toEqual([true, { x: 2 }]);
    });
  });

  describe('As pattern', () => {
    it('should bind alias on literals', () => {
      // case('x@1', ({ x }) => 'code')
      expect(run('x@1', [1])).toEqual([true, { x: 1 }]);
      expect(run('x@1, y@2', [1, 2])).toEqual([true, { x: 1, y: 2 }]);
      expect(run('x@true', [true])).toEqual([true, { x: true }]);
      expect(run('x@"text"', ['text'])).toEqual([true, { x: 'text' }]);
      // tslint:disable-next-line:quotemark
      expect(run("x@'text'", ['text'])).toEqual([true, { x: 'text' }]);
    });

    it('should bind alias on ranges', () => {
      expect(run('z@1..5', [3])).toEqual([true, { z: 3 }]);
    });

    it('should bind alias on variables', () => {
      expect(run('b@a', [3])).toEqual([true, { a: 3, b: 3 }]);
    });

    it('should bind alias on arrays', () => {
      expect(run('x@[1, 2, 3]', [[1, 2, 3]])).toEqual([true, { x: [1, 2, 3] }]);
      expect(run('[ x@1, 2, 3 ]', [[1, 2, 3]])).toEqual([true, { x: 1 }]);
      expect(run('[ 1, x@2, 3 ]', [[1, 2, 3]])).toEqual([true, { x: 2 }]);
      expect(run('z@[ x@1, 2, 3 ]', [[1, 2, 3]])).toEqual([true, { x: 1, z: [1, 2, 3] }]);
      expect(run('z@[ x@1, 2, 3 ]:Number', [[1, 2, 3]])).toEqual([true, { x: 1, z: [1, 2, 3] }]);
      // // ? expect(run('z@[ x@1, 2, _ ]:Number', [[1, 2, 3]])).toEqual([true, { x: 1, z: [1, 2, 3] }]);
      expect(run('z@[ x@1, 2, 3 ]:String', [[1, 2, 3]])).toEqual(FAIL);
      expect(run('x@[...]', [[1, 2, 3]])).toEqual([true, { x: [1, 2, 3] }]);
    });

    it('should bind alias on objects', () => {
      expect(run('x@{one: 1}', [{ one: 1 }])).toEqual([true, { x: { one: 1 } }]);
      expect(run('{one@: 1}', [{ one: 1 }])).toEqual([true, { one: 1 }]);
      expect(run('{one: { two: { three@:3 } }}', [{ one: { two: { three: 3 } } }])).toEqual([
        true,
        { three: 3 }
      ]);
      expect(run('x@{one@: 1, two: 2}', [{ one: 1, two: 2 }])).toEqual([
        true,
        { x: { one: 1, two: 2 }, one: 1 }
      ]);
      expect(run('x@{a@one: 1, two: 2}', [{ one: 1, two: 2 }])).toEqual([
        true,
        { x: { one: 1, two: 2 }, a: 1 }
      ]);
      expect(run('x@{one@one: 1, two: 2}', [{ one: 1, two: 2 }])).toEqual([
        true,
        { x: { one: 1, two: 2 }, one: 1 }
      ]);
    });

    it('should bind alias on sequences', () => {
      expect(run('x@(1, 2)', [1, 2])).toEqual([true, { x: [1, 2] }]);
      expect(run('x@(1, 2), 3', [1, 2, 3])).toEqual([true, { x: [1, 2] }]);
      expect(run('x@(1, 2), 3', [1, 2])).toEqual(FAIL);
      expect(run('z@(x, y)', [1, 2])).toEqual([true, { x: 1, y: 2, z: [1, 2] }]);
    });

    it('should bind alias with logical or', () => {
      expect(run('x@(1, 2 | 3, 4, 5)', [1, 2])).toEqual([true, { x: [1, 2] }]);
      expect(run('x@(1, 2 | 3, 4, 5)', [3, 4, 5])).toEqual([true, { x: [3, 4, 5] }]);
      expect(run('x@(1, 2 | 3, 4)', [3, 4])).toEqual([true, { x: [3, 4] }]);
      expect(run('x@(1 | 2, 3 | 4, 5, 6)', [1])).toEqual([true, { x: [1] }]);
      expect(run('x@(1 | 2, 3 | 4, 5, 6)', [2, 3])).toEqual([true, { x: [2, 3] }]);
      expect(run('x@(1 | 2, 3 | 4, 5, 6)', [4, 5, 6])).toEqual([true, { x: [4, 5, 6] }]);
    });

    it('should bind alias with logical and', () => {
      expect(run('x@(1, _ & _, 2)', [1, 2])).toEqual([true, { x: [1, 2] }]);
      expect(run('x@(1, _ & _, 2)', [1, 3])).toEqual(FAIL);
      expect(run('x@(1, _ & _, 2)', [1, 2, 3])).toEqual(FAIL);
      expect(run('x@(1, _, _ & _, 2, _ & _, _, 3)', [1, 2, 3])).toEqual([true, { x: [1, 2, 3] }]);
      expect(run('x@(1, Number & _, a)', [1, 2])).toEqual([true, { x: [1, 2], a: 2 }]);
    });
  });

  describe('Sequences', () => {
    it('should match simple sequence', () => {
      expect(run('1, 2, 3', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('1, 2, 3', [1, 2, 3, 4])).toEqual(FAIL);
      expect(run('1, 2, 3', [1, 2])).toEqual(FAIL);
      expect(run('1, 2, 3', [])).toEqual(FAIL);
    });

    it('should throw an error', () => {
      expect(() => {
        run('()', [1, 2, 3]);
      }).toThrowError();
    });

    it('should match grouped sequences', () => {
      expect(run('(1, 2), 3', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('(1, 2), 3', [1, 2, 3, 4])).toEqual(FAIL);
      expect(run('(1, 2), 3', [1, 2])).toEqual(FAIL);
      expect(run('(1, 2, 3)', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('(1, 2), 3, (4, 5)', [1, 2, 3, 4, 5])).toEqual(SUCCESS);
      expect(run('(1, (2)), 3', [1, 2, 3])).toEqual(SUCCESS);

      expect(run('1, ((2, (3, (4, 5))), 6)', [1, 2, 3, 4, 5, 6])).toEqual(SUCCESS);
      expect(run('1, ((2, (3, (4, 5))), 6)', [1, 2, 3, 4, 7, 6])).toEqual(FAIL);
      expect(run('1, ((2, (3, (4, 5))), 6)', [1, 2, 3, 4])).toEqual(FAIL);
      expect(run('((1, 2), 3)', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('((1, (2)), 3)', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('(((1, (2)), 3))', [1, 2, 3])).toEqual(SUCCESS);
      expect(run('(1), (2), (3)', [1, 2, 3])).toEqual(SUCCESS);
    });
  });

  describe('Type pattern', () => {
    it('should match an primitive type', () => {
      // case('Boolean', () => 'code')
      expect(run('Boolean', [true])).toEqual(SUCCESS);
      expect(run('Boolean', [false])).toEqual(SUCCESS);
      expect(run('Boolean', ['false'])).toEqual(FAIL);
      expect(run('Number', [1])).toEqual(SUCCESS);
      expect(run('Number', [-1])).toEqual(SUCCESS);
      expect(run('Number', [-1.2452])).toEqual(SUCCESS);
      expect(run('Number', ['-1.2452'])).toEqual(FAIL);
      expect(run('String', ['text'])).toEqual(SUCCESS);
      expect(run('String', [true])).toEqual(FAIL);
      expect(run('Undefined', [undefined])).toEqual(SUCCESS);
      expect(run('Null', [null])).toEqual(SUCCESS);
      expect(run('Array', [[1]])).toEqual(SUCCESS);
      expect(run('Object', [{}])).toEqual(SUCCESS);
      expect(
        run('Function', [
          () => {
            /**/
          }
        ])
      ).toEqual(SUCCESS);
      expect(run('RegExp', [/a-z/])).toEqual(SUCCESS);
      expect(run('Date', [new Date()])).toEqual(SUCCESS);
    });

    it('should match if is Nullable', () => {
      // case('Nullable', () => 'code')
      expect(run('Nullable', [{}])).toEqual(SUCCESS);
      expect(run('Nullable', [[]])).toEqual(SUCCESS);
      expect(run('Nullable', [''])).toEqual(SUCCESS);
      expect(run('Nullable', [0])).toEqual(SUCCESS);
      expect(run('Nullable', [undefined])).toEqual(SUCCESS);
      expect(run('Nullable', [null])).toEqual(SUCCESS);
      expect(run('Nullable', [1])).toEqual(FAIL);
      expect(run('Nullable', ['1'])).toEqual(FAIL);
      expect(run('Nullable', [[1]])).toEqual(FAIL);
      expect(run('Nullable', [{ one: 1 }])).toEqual(FAIL);
      expect(run('Nullable', [new Date()])).toEqual(FAIL);
    });

    it('should match typed variables, arrays and wildcards', () => {
      // case('x:Boolean, y:Object', ({ x, y }) => 'code')
      expect(run('x:Boolean, y:Object', [true, { one: 1 }])).toEqual([
        true,
        { x: true, y: { one: 1 } }
      ]);
      expect(run('x:Boolean, y:Object', ['true', { one: 1 }])).toEqual(FAIL);
      expect(run('_:String', ['text'])).toEqual(SUCCESS);
      expect(run('_:String', ['text', 'wrong'])).toEqual(FAIL);
      expect(run('_:String', [1])).toEqual(FAIL);
      expect(run('[...]:Number', [[1, 2, 3]])).toEqual(SUCCESS);
      expect(run('[...]:String', [['1', '2', '3']])).toEqual(SUCCESS);
      expect(run('[...]:String', [['1', 2, '3']])).toEqual(FAIL);
    });

    it('should match instances', () => {
      // case('Color', () => 'code')

      function Color() {
        /**/
      }
      const red = new Color();

      expect(run('Color', [red])).toEqual(SUCCESS);
      expect(run('Color', [1])).toEqual(FAIL);
    });
  });

  describe('Errors', () => {
    it('should throw a error with a friendly message', () => {
      expect(() => {
        compile('1x');
      }).toThrowError(/Match-toy Syntax Error/);
    });
  });
});
