import { FAIL } from '../constants';
import { addAlias, addBind } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const range = (input: string | number, node: AstNode): MatchResult => {
  const { start = 0, end = 0 } = node;

  if (typeof input !== typeof start || typeof input !== typeof start) {
    return FAIL;
  }

  return input >= start && input <= end ? [ true, {...addBind(node, input), ...addAlias(node, input)} ] : FAIL;
};
