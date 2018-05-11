import { contains, is, reverse } from '../helpers';

describe('Helpers', () => {

  describe('is', () => {
    it('should check type', () => {
      expect(is('', 'String')).toBe(true);
      expect(is(1, ['String', 'Number'])).toBe(true);
      expect(is('1', ['String', 'Number'])).toBe(true);
      expect(is(true, ['String', 'Number'])).toBe(false);
      expect(is(1, 'String')).toBe(false);
      expect(is(1, undefined)).toBe(false);
    });
  });

  describe('Reverse', () => {
    it('should return a copy of an array with item on revesed order', () => {
      const original = [1, 2, 3, 4];
      const reversed = reverse(original);
      expect(reversed).toEqual([4, 3, 2, 1]);
      expect(original).toEqual([1, 2, 3, 4]);
      expect(reverse()).toEqual([]);
    });
  });

  describe('Contains', () => {
    it('should check array contains the value', () => {
      expect(contains(1, [1, 2, 3])).toBe(true);
    });
  });

});
