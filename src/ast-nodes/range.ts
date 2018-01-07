import { FAIL, SUCCESS } from '../constants';
import { AstNode, MatchResult } from '../types';

export const range = (input: string | number, node: AstNode): MatchResult => {
  const args = {};
  const { start = 0, end = 0 } = node;
  if (typeof input !== typeof start || typeof input !== typeof start) {
    return FAIL;
  }
  if (node.bind) {
    args[node.bind] = input;
  }
  if (node.alias) {
    args[node.alias] = input;
  }
  return input >= start && input <= end ? [ true, args ] : FAIL;
};
