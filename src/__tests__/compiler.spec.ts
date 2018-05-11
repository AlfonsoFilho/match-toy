import { compile } from '../compiler';

const makeParserError = ([offsetStart, offsetEnd], found, expected) => {
  return {
    location:{
      start: {
        offset: offsetStart
      },
      end: {
        offset: offsetEnd
      }
    },
    found,
    expected
  }
}

describe('Compiler', () => {
  it('should call parser', () => {
    const parse = jest.fn();
    compile('x', parse);
    expect(parse).toBeCalledWith('x', {});
  });

  it('should handle end error', () => {
    const parse = () => { 
      throw makeParserError([3, 4], '?', [
        { type: 'end' } 
      ]);
    };

    expect(() => {
      compile('x, ?', parse);
    }).toThrowError(`Match-toy Syntax Error:
x, ?
   ^

Found \`?\`, but expected one of:
 - end of the code
`);
  });

  it('should handle description parser', () => {
    const parse = () => { 
      throw makeParserError([3, 4], '?', [
        { description: 'literal' } 
      ]);
    };

    expect(() => {
      compile('x, ?', parse);
    }).toThrowError(`Match-toy Syntax Error:
x, ?
   ^

Found \`?\`, but expected one of:
 - literal
`);
  });

it('should handle text error', () => {
  const parse = () => { 
    throw makeParserError([0, 4], '?', [
      { text: 'literal' } 
    ]);
  };

  expect(() => {
    compile('x, ?', parse);
  }).toThrowError(`Match-toy Syntax Error:
x, ?
^^^^

Found \`?\`, but expected one of:
 - literal
`);
  });
});