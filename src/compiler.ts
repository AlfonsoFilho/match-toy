import { parse, ParseFunction } from './grammar.gen';
import { Pattern } from './types';

const getExpected = (err) => err.map((it) => {
  if (it.type === 'end') {
    return ' - end of the code';
  }
  return ` - ${it.description || it.text}`;
}).join('\n');

const makeCaret = (source, location) => {
  const start = location.start.offset;
  const end = location.end.offset;

  return source.split('').map((it, index) => {
    if (index < start || index > end) {
      return ' ';
    } else {
      return '^';
    }
  }).join('');
};

export const compile = (source: string, _parse: ParseFunction = parse): Pattern => {
  try {
    return (_parse(source, {}) as Pattern);
  } catch (error) {
    throw new Error(`Match-ish Syntax Error:
${source}
${makeCaret(source, error.location)}

Found \`${error.found}\`, but expected one of:
${getExpected(error.expected)}
`);
  }
};
