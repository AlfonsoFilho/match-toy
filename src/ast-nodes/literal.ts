import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const literal = (input: any[], node: AstNode): MatchResult => {
  const args = {};
  if (node.bind) {
    args[node.bind] = input;
  }
  if (node.alias) {
    args[node.alias] = input;
  }
  return node.value === input && isType(input, node) ? [ true, args ] : FAIL;
};
