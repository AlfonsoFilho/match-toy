import { compile } from './compiler';
import { interpreter } from './interpreter';

describe('Interpreter', () => {

  const FAIL = [ false, {} ];
  let pattern;

  describe('Constant pattern', () => {

    describe('when matching single numbers', () => {
      beforeEach(() => {
        // with('1', () => 'code')
        pattern = compile('1');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1])).toEqual([ true, {} ]);
      });

      it('should not match if input is different', () => {
        expect(interpreter(pattern, [2])).toEqual(FAIL);
      });

      it('should not match if input is empty', () => {
        expect(interpreter(pattern, [])).toEqual(FAIL);
      });

      it('should not match if input length is different', () => {
        expect(interpreter(pattern, [1, 2])).toEqual(FAIL);
      });
    });

    describe('when matching many numbers', () => {
      beforeEach(() => {
        // with('1, 2', () => 'code')
        pattern = compile('1, 2');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, 2])).toEqual([ true, {} ]);
      });

      it('should not match if input is different', () => {
        expect(interpreter(pattern, [2, 2])).toEqual(FAIL);
      });

      it('should not match if input length is different', () => {
        expect(interpreter(pattern, [1, 2, 3])).toEqual(FAIL);
      });
    });

    describe('when matching booleans', () => {
      beforeEach(() => {
        // with('true', () => 'code')
        pattern = compile('true');
      });

      it('should match', () => {
        expect(interpreter(pattern, [true])).toEqual([ true, {} ]);
      });

      it('should not match', () => {
        expect(interpreter(pattern, [false])).toEqual(FAIL);
        expect(interpreter(pattern, ['true'])).toEqual(FAIL);
      });
    });

    describe('when matching strings', () => {
      beforeEach(() => {
        // with('"text"', () => 'code')
        pattern = compile('"text"');
      });

      it('should match', () => {
        expect(interpreter(pattern, ['text'])).toEqual([ true, {} ]);
      });

      it('should not match', () => {
        expect(interpreter(pattern, ['wrong'])).toEqual(FAIL);
        expect(interpreter(pattern, ['text', 'wrong'])).toEqual(FAIL);
      });
    });

    describe('when matching simple objects', () => {
      beforeEach(() => {
        // with('{ one: 1, two: 2 }', () => 'code')
        pattern = compile('{ one: 1, two: 2 }');
      });

      it('should match', () => {
        expect(interpreter(pattern, [{ one: 1, two: 2 }])).toEqual([ true, {} ]);
      });

      it('should not match if key is different', () => {
        expect(interpreter(pattern, [{ wrong: 1 }])).toEqual(FAIL);
      });

      it('should not match if object is empty', () => {
        expect(interpreter(pattern, [{ }])).toEqual(FAIL);
      });
    });

    describe('when matching depth objects', () => {
      beforeEach(() => {
        // with('{ one: { two: 2 } }', () => 'code')
        pattern = compile('{ one: { two: 2 } }');
      });

      it('should match', () => {
        expect(interpreter(pattern, [{ one: { two: 2 } }])).toEqual([ true, {} ]);
      });

      it('should not match if object value is different', () => {
        expect(interpreter(pattern, [{ one: { two: 1 } }])).toEqual(FAIL);
      });

      it('should not match if schema is different', () => {
        expect(interpreter(pattern, [{ one: 2 }])).toEqual(FAIL);
        expect(interpreter(pattern, [{ one: { three: 2 } }])).toEqual(FAIL);
        expect(interpreter(pattern, [{ wrong: { three: 2 } }])).toEqual(FAIL);
      });
    });

    describe('when matching simple arrays', () => {
      beforeEach(() => {
        // with('[1, 2, 3]', () => 'code')
        pattern = compile('[1, 2, 3]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual([ true, {} ]);
      });

      it('should not match if array values are different', () => {
        expect(interpreter(pattern, [[3, 2, 1]])).toEqual(FAIL);
      });

      it('should not match if array length is different', () => {
        expect(interpreter(pattern, [[]])).toEqual(FAIL);
        expect(interpreter(pattern, [[1]])).toEqual(FAIL);
        expect(interpreter(pattern, [[1, 2, 3, 4]])).toEqual(FAIL);
      });
    });

    describe('when matching depth arrays', () => {
      beforeEach(() => {
        // with('[1, [1, 2], 3]', () => 'code')
        pattern = compile('[1, [1, 2], 3]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, [1, 2], 3]])).toEqual([ true, {} ]);
      });
    });

    describe('when matching multiple types', () => {
      beforeEach(() => {
        // with('1, 2, { one: 1}, true, [ 1 ]', () => 'code')
        pattern = compile('1, 2, { one: 1}, true, [ 1 ]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, 2, { one: 1 }, true, [1]])).toEqual([ true, {} ]);
      });
    });

    describe('when matching complex literal pattern', () => {
      beforeEach(() => {
        // with('["a", [ { b: "true", c: { d: false }}], 0], "text"', () => 'code')
        pattern = compile('["a", [ { b: "true", c: { d: false }}], 0], "text"');
      });

      it('should match', () => {
        expect(interpreter(pattern, [['a', [ { b: 'true', c: { d: false }}], 0], 'text'])).toEqual([ true, {} ]);
      });
    });
  });

  describe('Bind pattern', () => {
    describe('when matching single bind', () => {
      beforeEach(() => {
        // with('x', ({x}) => `x is equal to: ${x}`)
        pattern = compile('x');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1])).toEqual([ true, {x: 1} ]);
      });
    });

    describe('when matching many binds', () => {
      beforeEach(() => {
        // with('x, y', ({x, y}) => `x is ${x} and y is ${y}`)
        pattern = compile('x, y');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, 2])).toEqual([ true, {x: 1, y: 2} ]);
      });
    });

    describe('when matching bind with contants', () => {
      beforeEach(() => {
        // with('x, y, 1', ({x, y}) => x + y)
        pattern = compile('x, y, 1');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, 2, 1])).toEqual([ true, {x: 1, y: 2} ]);
      });

      it('should not match if constant is different', () => {
        expect(interpreter(pattern, [1, 2, 2])).toEqual(FAIL);
      });
    });

    describe('when matching bind from objects', () => {
      beforeEach(() => {
        // with('{one: x, two: y}', ({x, y}) => `x is ${x} and y is ${y}`)
        pattern = compile('{one: x, two: y}');
      });

      it('should match', () => {
        expect(interpreter(pattern, [{ one: 1, two: 2}])).toEqual([ true, {x: 1, y: 2} ]);
      });

      it('should not match if object key is different', () => {
        expect(interpreter(pattern, [{ one: 1, wrong: 2}])).toEqual(FAIL);
      });

      it('should not match if keys length is different', () => {
        expect(interpreter(pattern, [{ one: 1, two: 2, three: 3}])).toEqual(FAIL);
      });

      it('should not match if key is missing', () => {
        expect(interpreter(pattern, [{ one: 1 }])).toEqual(FAIL);
      });
    });

    describe('when matching bind from objects with same key name', () => {
      beforeEach(() => {
        // with('{x, y}', ({x, y}) => `x is ${x} and y is ${y}`)
        pattern = compile('{x, y}');
      });

      it('should match', () => {
        expect(interpreter(pattern, [{ x: 1, y: 2 }])).toEqual([ true, {x: 1, y: 2} ]);
      });

      it('should not match if key is different', () => {
        expect(interpreter(pattern, [{ x: 1, z: 2 }])).toEqual(FAIL);
      });

      it('should not match if keys length is different', () => {
        expect(interpreter(pattern, [{ x: 1, y: 2, z: 3 }])).toEqual(FAIL);
      });

      it('should not match if object is empty', () => {
        expect(interpreter(pattern, [{ }])).toEqual(FAIL);
      });
    });

    describe('when matching bind from arrays', () => {
      beforeEach(() => {
        // with('[x, y]', ({x, y}) => x + y)
        pattern = compile('[x, y]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2]])).toEqual([ true, {x: 1, y: 2} ]);
      });

      it('should not match if input length is different', () => {
        expect(interpreter(pattern, [[1, 2], 1])).toEqual(FAIL);
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual(FAIL);
      });

      it('should not match if array length is smaller', () => {
        expect(interpreter(pattern, [[1]])).toEqual(FAIL);
      });
    });
  });

  describe('Wildcard pattern', () => {

    describe('when matching simple wildcard', () => {
      beforeEach(() => {
        // with('_', () => 'code')
        pattern = compile('_');
      });

      it('should match', () => {
        expect(interpreter(pattern, ['_'])).toEqual([true, {}]);
      });
    });

    describe('when matching wildcard with constant', () => {
      beforeEach(() => {
        // with('1, _', () => 'code')
        pattern = compile('1, _');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, '_'])).toEqual([true, {}]);
      });
    });

    describe('when matching wildcard inner an object', () => {
      beforeEach(() => {
        // with('{ a: 1, b: _, c: 1 }', () => x + y)
        pattern = compile('{ a: 1, b: _, c: 1 }');
      });

      it('should match', () => {
        expect(interpreter(pattern, [{a: 1, b: '_', c: 1}])).toEqual([true, {}]);
      });
    });

    describe('when matching wildcard inner an array', () => {
      beforeEach(() => {
        // with('[1, _, 1]', () => x + y)
        pattern = compile('[1, _, 1]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, '_', 1]])).toEqual([true, {}]);
      });
    });
  });

  describe('List pattern',  () => {
    describe('when matching empty list', () => {
      beforeEach(() => {
        // with('[]', () => x + y)
        pattern = compile('[]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[]])).toEqual([true, {}]);
      });

      it('should not match if is not empty', () => {
        expect(interpreter(pattern, [[1]])).toEqual(FAIL);
      });
    });

    describe('should match and bind list with any items', () => {
      beforeEach(() => {
        // with('[...all]', () => 'code')
        pattern = compile('[...all]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1]])).toEqual([true, { all: [1]}]);
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual([true, { all: [1, 2, 3] }]);
      });

      it('should not match empty arrays', () => {
        expect(interpreter(pattern, [[]])).toEqual(FAIL);
      });
    });

    describe('should match list with any items', () => {
      beforeEach(() => {
        // with('[...]', () => 'code')
        pattern = compile('[...]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1]])).toEqual([true, {}]);
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual([true, {}]);
      });

      it('should not match empty arrays', () => {
        expect(interpreter(pattern, [[]])).toEqual(FAIL);
      });
    });

    describe('when matching head|tail list', () => {
      beforeEach(() => {
        // with('[head, ...tail]', ({head, tail}) => void)
        // with('x:xs', ({x, xs}) => void)
        pattern = compile('[head, ...tail]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2, 3]])).toEqual([true, { head: 1, tail: [2, 3] }]);
      });
    });

    describe('should split list', () => {
      beforeEach(() => {
        // with('[a, b, c, ...xs]', ({a, b, c, rest}) => void)
        // with('a:b:c:xs', ({a, b, c, xs}) => void)
        pattern = compile('[a, b, c, ...xs]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2, 3, 4, 5, 6]])).toEqual([true, { a: 1, b: 2, c: 3, xs: [4, 5, 6]  }]);
      });
    });

    describe('should allow rest in the middle od the list', () => {
      beforeEach(() => {
        // with('[a, ...btox, y, z]', ({a, b, c, rest}) => void)
        // with('a:b:c:xs', ({a, b, c, xs}) => void)
        pattern = compile('[a, ...btox, y, z]');
      });

      it('should match', () => {
        expect(interpreter(pattern, [[1, 2, 3, 4, 5, 6]])).toEqual([true, { a: 1, btox: [2, 3, 4], y: 5, z: 6 }]);
      });
    });
  });

  describe('Range pattern', () => {
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
  });

  describe('Or pattern', () => {
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

  describe('And pattern', () => {
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

  describe('As pattern', () => {
    describe('should bind all input values ', () => {
      beforeEach(() => {
        // with('x, y as z', ({x, y, z}) => "x = 1, y =2 z= {x:1, y:2}")
        pattern = compile('x, y as z');
      });

      it('should match', () => {
        expect(interpreter(pattern, [1, 2])).toEqual([true, { x: 1, y: 2, z: [1, 2] }]);
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

  describe('Type pattern', () => {

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
  });
});
