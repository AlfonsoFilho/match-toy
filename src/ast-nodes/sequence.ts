import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, AstType, MatchResult } from '../types';

const allValid = (result, input, node): MatchResult => {
  if (result.every(([status, _]: MatchResult) => status === true)) {
    const alias = node.alias ? { [node.alias]: input } : {};
    return [ true, result.reduce((acc: object, it: MatchResult) => ({ ...acc, ...it[1], ...alias }), {}) ];
  } else {
    return FAIL;
  }
};

const flatSeq = (a) => a.value.reduce((acc, it) => {
    if (it.type === AstType.SEQUENCE) {
      acc = acc + flatSeq(it);
    } else {
      acc = acc + 1;
    }
    return acc;
  }, 0);

export const sequence = (input: any[], node: AstNode): MatchResult => {

  let currentIndex = 0;

  const result = node.value.map((it) => {

    if (it.type === AstType.SEQUENCE) {
      const L = flatSeq(it);
      const r = sequence(input.slice(currentIndex, currentIndex + L), it);
      currentIndex = currentIndex + L;
      return r;
    }

    if (it.type === AstType.OR || it.type === AstType.AND) {
      const [ s, r ] = interpreter({ root: it }, input);
      currentIndex = currentIndex + input.length;

      const args = {};
      if (it.alias) {
        args[it.alias] = input;
      }
      return [ s, { ...r, ...args } ];
    }

    const nr = interpreter({ root: it }, input[currentIndex]);
    currentIndex++;
    return nr;
  });

  if (input.length !== currentIndex) {
    return FAIL;
  }

  return allValid(result, input, node);
};
