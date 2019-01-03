import { FAIL } from '../constants';
import { addAlias } from '../helpers';
import { AstNode, AstType, MatchResult } from '../types';

const validate = (result: MatchResult[], input: any[], node: AstNode): MatchResult => {
  if (result.every(([status, _]: MatchResult) => status === true)) {
    return [
      true,
      result.reduce(
        (acc: object, [_, itemResult]: MatchResult) => ({
          ...acc,
          ...itemResult,
          ...addAlias(node, input)
        }),
        {}
      )
    ];
  } else {
    return FAIL;
  }
};

const flatSeq = (a: AstNode) =>
  a.value.reduce((acc: number, it: AstNode) => {
    if (it.type === AstType.SEQUENCE) {
      acc = acc + flatSeq(it);
    } else {
      acc = acc + 1;
    }
    return acc;
  }, 0);

export const sequence = (input: any[], node: AstNode, interpreter): MatchResult => {
  let currentIndex = 0;

  const result = node.value.map((it: AstNode) => {
    if (it.type === AstType.SEQUENCE) {
      const sequenceLength = flatSeq(it);
      const sequenceResult = sequence(
        input.slice(currentIndex, currentIndex + sequenceLength),
        it,
        interpreter
      );
      currentIndex = currentIndex + sequenceLength;
      return sequenceResult;
    }

    if (it.type === AstType.OR || it.type === AstType.AND) {
      const [s, r] = interpreter({ root: it }, input);
      currentIndex = currentIndex + input.length;

      return [s, { ...r, ...addAlias(node, input) }];
    }

    const nr = interpreter({ root: it }, input[currentIndex]);
    currentIndex++;
    return nr;
  });

  if (input.length !== currentIndex) {
    return FAIL;
  }

  return validate(result, input, node);
};
