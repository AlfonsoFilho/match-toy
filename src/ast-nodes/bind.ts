import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const bind = (input: any[], node: AstNode): MatchResult => {
  const args = {};
  args[node.bind] = input;
  if (node.alias) {
    args[node.alias] = input;
  }
  return isType(input, node) ? [ true, args ] : FAIL;
};
