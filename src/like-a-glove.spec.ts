
import { match, TYPES } from './like-a-glove';

describe('NEW', () => {
  describe('integrations', () => {
    it('simple match one', () => {
      const simple = match()
        .with('1', () => 'one')
        .end();

      expect(simple(1)).toBe('one');
    });

    it('simple match 2', () => {
      const simple = match()
        .with('1', () => 'one')
        .with('2, 2', () => 'one and two')
        .end();

      expect(simple(1)).toBe('one');
      expect(simple(2, 2)).toBe('one and two');
      // UNDEFINED??
      expect(simple(2, 2, 3)).toBeUndefined();
    });

    it('simple match 3', () => {
      const simple = match()
        .with('1, x', ({ x }) => `is ${x}`)
        .else(() => 'no match')
        .end();

      expect(simple(1, 2)).toBe('is 2');
      expect(simple(false)).toBe('no match');
    });

    it('simple match 4', () => {
      const simple = match()
        .with('{ one: 1 }', () => 'one')
        .with('{ two: x }', ({ x }) => `two is ${x}`)
        .else(() => 'no match')
        .end();

      expect(simple({ one: 1 })).toBe('one');
      expect(simple({ two: 2 })).toBe('two is 2');
      expect(simple(false)).toBe('no match');
    });
  });
});

// const simple = match()
// .with('1', (x, y) => x + y)
// .with(0, () => 0).when(isInt)
// .with('_', () => false)
// .else(() => false)
// .catch(() => console.log(error))
// .end();

/*
const Teste = match()
  .with('{x, y', (x, y) => x + y)
  .with(0, () => 0).when(isInt)
  .with('_', () => false)
  .else(() => false)
  .catch(() => console.log(error))

 */
