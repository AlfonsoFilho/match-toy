import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const literal = (input: any[], node: AstNode): MatchResult => {
  const args = {};
  if (node.name) {
    args[node.name] = input;
  }
  return node.value === input && isType(input, node) ? [ true, args ] : FAIL;
};
