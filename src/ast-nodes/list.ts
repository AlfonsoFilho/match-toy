import { FAIL } from '../constants';
import { addAlias, addBind, getRest, is, isType, reverse } from '../helpers';
import { AstNode, AstType, MatchResult } from '../types';

export const list = (input: any[], node: AstNode, interpreter): MatchResult => {
  const restNode = getRest(node.value);

  if (
    !is(input, 'Array') ||
    (!!restNode ? input.length === 0 : input.length !== node.value.length)
  ) {
    return FAIL;
  }

  if (!input.every(it => isType(it, node))) {
    return FAIL;
  }

  if (restNode) {
    const nthBefore = node.value.findIndex(({ type }: AstNode) => type === AstType.REST);
    const nthAfter = reverse(node.value).findIndex(({ type }: AstNode) => type === AstType.REST);

    const restContent = input.slice(nthBefore, input.length - nthAfter);

    if (restContent.length === 0) {
      return FAIL;
    }

    if (!restNode.bind) {
      return [true, { ...addBind(node, restContent), ...addAlias(node, restContent) }];
    }

    input = [
      ...input.slice(0, nthBefore),
      restContent,
      ...input.slice(input.length - nthAfter, input.length)
    ];
  }

  const matchResult = input.map((inputValue, index) => {
    return interpreter({ root: node.value[index] }, inputValue);
  });

  if (matchResult.every(([status, _]) => status === true)) {
    return [
      true,
      matchResult.reduce((acc, it) => ({ ...acc, ...it[1] }), {
        ...addBind(node, node.value.map(({ value }: AstNode) => value)),
        ...addAlias(node, node.value.map(({ value }: AstNode) => value))
      })
    ];
  } else {
    return FAIL;
  }
};
