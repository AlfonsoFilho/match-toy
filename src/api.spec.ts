
import { match } from './api';
import { ErrorMessages } from './types';

describe('API', () => {
  describe('basic match value', () => {

    it('should return match result', () => {
      const matchResult = match(1)
        .case('1', () => 'one')
        .end();

      expect(matchResult).toBe('one');
    });

    it('should return match result with many inputs', () => {
      const matchResult = match(1, 2)
        .case('1, 2', () => 'one and two')
        .end();

      expect(matchResult).toBe('one and two');
    });

    it('should return match result using return()', () => {
      const matchResult = match()
        .case('1', () => 'one')
        .return(1);

      expect(matchResult).toBe('one');
    });

    it('should return match result with many inputs using return()', () => {
      const matchResult = match()
        .case('1, 2', () => 'one and two')
        .return(1, 2);

      expect(matchResult).toBe('one and two');
    });

    it('should have alias with()', () => {
      const matchResult = match(1)
        .with('1', () => 'one')
        .end();

      expect(matchResult).toBe('one');
    });

    it('should return result when passing multiple values', () => {
      const matchResult = match(1, 2)
        .case('1', () => 'one')
        .case('1, 2', () => 'one and two')
        .end();

      expect(matchResult).toBe('one and two');
    });

    it('should return undefined when match fails', () => {
      const matchResult = match(2)
        .case('1', () => 'one')
        .end();

      expect(matchResult).toBeUndefined();
    });

    it('should return value', () => {
      const matchResult = match()
        .case('1', 'one')
        .return(1);

      expect(matchResult).toEqual('one');
    });

    it('should return value', () => {
      const matchResult = match()
        .case('1', true)
        .return(1);

      expect(matchResult).toEqual(true);
    });
  });

  describe('basic match function', () => {
    it('should return function', () => {
      const isOneOrTwo = match()
        .case('1', () => 'one')
        .case('2', () => 'two')
        .end();

      expect(typeof isOneOrTwo).toBe('function');
      expect(isOneOrTwo(1)).toBe('one');
    });

    it('should return undefined if match fails', () => {
      const isOneOrTwo = match()
        .case('1', () => 'one')
        .case('2', () => 'two')
        .end();

      expect(isOneOrTwo(3)).toBeUndefined();
    });

  });

  describe('guards', () => {
    it('simple guard', () => {
      const isOneOrTwo = match()
        .case('x@1..10', () => 'is even').when(({x}) => x % 2 === 0)
        .case('1..10', () => 'is odd')
        .else(() => 'not a real number')
        .end();

      expect(isOneOrTwo(3)).toBe('is odd');
      expect(isOneOrTwo(2)).toBe('is even');
      expect(isOneOrTwo(11)).toBe('not a real number');
    });

    it('simple guard with many values', () => {
      const isOneOrTwo = match()
        .case('1..10, x', () => 'is short').when(({ x }) => x.length <= 5)
        .case('1..10, x', () => 'is big')
        .else(() => 'don\'t match')
        .end();

      expect(isOneOrTwo(3, 'hi')).toBe('is short');
      expect(isOneOrTwo(3, 'good evening')).toBe('is big');
    });

    it('should throw an error when more than one guard is defined per pattern', () => {

      expect(() => {
        const isOneOrTwo = match()
        .case('1..10, x', () => 'is short')
          .when((_, y) => y.length <= 5)
          .when((_, y) => y.length <= 1)
        .case('1..10, x', () => 'is big')
        .else(() => 'don\'t match')
        .end();
      }).toThrowError(ErrorMessages.ONE_GUARD_PER_PATTERN);
    });
  });

  describe('do', () => {
    it('should allow add callback using do function', () => {
      const isOneOrTwo = match()
        .case('1').do(() => 'is one')
        .case('2').do(() => 'is two')
        .end();

      expect(isOneOrTwo(1)).toBe('is one');
      expect(isOneOrTwo(2)).toBe('is two');
    });

    it('should throw an error if predicate is not defined', () => {
      expect(() => {
        const isOneOrTwo = match()
          .case('1')
          .case('2').do(() => 'is two')
          .end();

        isOneOrTwo(1);

      }).toThrowError(ErrorMessages.MISSING_PREDICATE);
    });
  });

  describe('Nesting matching', () => {
    const nestedFn = match()
      .case('_:String, x', ({x}) =>
        match(x)
          .case('y', ({ y }) => `Value ${y} is even`).when(({ y }) => y % 2 === 0)
          .case('y', ({ y }) => `Value ${y} is odd`)
          .end())
      .end();
    expect(nestedFn('test', 2)).toBe('Value 2 is even');
  });

  describe('alternative syntax', () => {
    it('should be able to define pattern, callback and guard within a with statement', () => {
      const isOneOrTwo = match()
        .case('x', ({x}) => `${x} is even`, ({x}) => x % 2 === 0)
        .case('x', ({x}) => `${x} is odd`)
        .end();

      expect(isOneOrTwo(1)).toBe('1 is odd');
      expect(isOneOrTwo(2)).toBe('2 is even');
    });

    it('should being able to define patten and callback in a single with and a when ', () => {
      const isOneOrTwo = match()
        .case('x', ({x}) => `${x} is even`).when(({x}) => x % 2 === 0)
        .case('x', ({x}) => `${x} is odd`)
        .end();

      expect(isOneOrTwo(1)).toBe('1 is odd');
      expect(isOneOrTwo(2)).toBe('2 is even');
    });

    it('should being able to define patten, callback and guard separately', () => {
      const isOneOrTwo = match()
        .case('x').do(({x}) => `${x} is even`).when(({x}) => x % 2 === 0)
        .case('x', ({x}) => `${x} is odd`)
        .end();

      expect(isOneOrTwo(1)).toBe('1 is odd');
      expect(isOneOrTwo(2)).toBe('2 is even');
    });

    it('should being able to define patten, callback and guard separately on different order', () => {
      const isOneOrTwo = match()
        .case('x').when(({x}) => x % 2 === 0).do(({x}) => `${x} is even`)
        .case('x', ({x}) => `${x} is odd`)
        .end();

      expect(isOneOrTwo(1)).toBe('1 is odd');
      expect(isOneOrTwo(2)).toBe('2 is even');
    });
  });

  describe('else', () => {
    it('should use else when nothing matches', () => {
      const isOneOrTwo = match()
        .case('1', () => 'is one')
        .case('2', () => 'is two')
        .else(() => 'don\'t match')
        .end();

      expect(isOneOrTwo(3)).toBe('don\'t match');
    });
  });

  describe('catch', () => {
    it('should use else when nothing matches', () => {
      const isOneOrTwo = match()
        .case('true', () => JSON.parse('wrong json syntax'))
        .end();

      expect(isOneOrTwo(true)).toEqual(expect.stringMatching(/^Match error/));
    });

    it('should use else when nothing matches', () => {
      const cb = jest.fn();
      const isOneOrTwo = match()
        .case('true', () => JSON.parse('wrong json syntax'))
        .catch((e) => {
          cb();
          return 'Custom message';
        })
        .end();
      expect(isOneOrTwo(true)).toEqual(expect.stringMatching(/^Custom message/));
      expect(cb).toHaveBeenCalled();
    });

    it('should use else when nothing matches', () => {
      const isOneOrTwo = match()
        .case('true', () => JSON.parse('wrong json syntax'))
        .catch((e) => {
          // tslint:disable-next-line:no-string-throw
          throw 'call default error message';
        })
        .end();

      expect(isOneOrTwo(true)).toEqual(expect.stringMatching(/^Match error: call default error message/));
    });
  });

  describe('end', () => {
    it('should throw error ', () => {
      expect(() => {
        const isOneOrTwo = match()
        .end();
      }).toThrowError(ErrorMessages.NO_PATTERN_DEFINED);
    });
  });
});
