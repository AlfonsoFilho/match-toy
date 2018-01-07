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

const flatLogical = ({ lhs, rhs }) => {
  const L = [ lhs, rhs ].map((it) => {
    if (it.type === AstType.OR) {
      return flatLogical(it);
    } else {
      return flatSeq(it);
    }
  });

  return L;
};

export const sequence = (input: any[], node: AstNode): MatchResult => {
  // console.log('SEQ', input, node)
  let currentIndex = 0;

  const result = node.value.map((it) => {

    // NOTE: Iterate sequce. TEST OK
    if (it.type === AstType.SEQUENCE) {
      const L = flatSeq(it);
      const r = sequence(input.slice(currentIndex, currentIndex + L), it);
      currentIndex = currentIndex + L;
      return r;
    }

    // NOTE: Iterate logic. VERY BUGGY
    if (it.type === AstType.OR) {

      const [ lhsLength, rhsLength ] = flatLogical(it);

      const subNewInput = input.slice(currentIndex, currentIndex + lhsLength);
      const LL = interpreter({ root: it.lhs }, subNewInput);
      const [ lhsStatus, lhsResult ]  = interpreter({ root: it.lhs }, subNewInput);

      const args = {};

      if (lhsStatus === true) {
        if (it.alias) {
          args[it.alias] = subNewInput;
        }
        currentIndex = currentIndex + lhsLength;
        return [ lhsStatus, { ...lhsResult, ...args } ];
      } else {
        // Right side buggy
        // console.log('RHS', rhsLength);
        // console.log('RHS', it.rhs);
        // const r = sequence(input.slice(currentIndex, currentIndex + rhsLength), { value: [it.rhs] });
      }
    }

    // NOTE: Iterate value. TEST OK
    const nr = interpreter({ root: it }, input[currentIndex]);
    currentIndex++;
    return nr;
  });

  if (input.length !== currentIndex) {
    // console.log('FAIL', input, currentIndex);
    return FAIL;
  }
  // console.log('result', result)
  return allValid(result, input, node);
};
