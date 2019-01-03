import { FAIL } from '../constants';
import { addAlias, addBind, isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const literal = (input: any[], node: AstNode): MatchResult => {
  return node.value === input && isType(input, node)
    ? [
        true,
        {
          ...addBind(node, input),
          ...addAlias(node, input)
        }
      ]
    : FAIL;
};
