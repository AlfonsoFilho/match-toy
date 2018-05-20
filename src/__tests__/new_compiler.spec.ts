
import { compile } from '../../modules/compiler.bs';

describe('Compiler', () => {
  it('should works', () => {
    expect(compile('x, y teste')).toEqual([
      ['WORD', 'x']
    ]);
  });
});
