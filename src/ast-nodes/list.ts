import { FAIL, SUCCESS } from '../constants';
import { getRest, hasRest, is, isType, reverse } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, AstType, MatchResult } from '../types';

export const list = (input: any[], node: AstNode): MatchResult => {

  // console.log('LIST', input, node);

  const inputContainsRest = hasRest(node.value);

  if (!is(input, 'Array') || (inputContainsRest ? input.length === 0 : input.length !== node.value.length)) {
    return FAIL;
  }

  if (!input.every((it) => isType(it, node))) {
    return FAIL;
  }

  if (inputContainsRest) {

    const restNode = getRest(node.value) || {} as AstNode;

    const nthBefore = node.value.findIndex(({ type }: AstNode) => type === AstType.REST);
    const nthAfter = reverse(node.value).findIndex(({ type }: AstNode) => type === AstType.REST);

    const restContent = input.slice(nthBefore, input.length - nthAfter);

    if (restContent.length === 0) {
      return FAIL;
    }

    const args = {};
    if (node.bind) {
      args[node.bind] = restContent;
    }
    if (node.alias) {
      args[node.alias] = restContent;
    }

    if (!restNode.bind) {
      return [ true, args ];
    }

    input = [
      ...input.slice(0, nthBefore),
      restContent,
      ...input.slice(input.length - nthAfter, input.length)
    ];
  }

  const matchResult = input.map((inputValue, index) => {
    return interpreter({root: node.value[index]}, inputValue);
  });

  if (matchResult.every(([status, _]) => status === true)) {
    const args = {};
    if (node.bind) {
      args[node.bind] = node.value.map(({value}) => value);
    }

    if (node.alias) {
      args[node.alias] = node.value.map(({value}) => value);
    }
    return [ true, matchResult.reduce((acc, it) => ({ ...acc, ...it[1] }), args) ];
  } else {
    return FAIL;
  }
};
