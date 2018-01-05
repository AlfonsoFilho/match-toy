import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const bind = (input: any[], node: AstNode): MatchResult => {
  return isType(input, node) ? [ true, { [node.value]: input } ] : FAIL;
};
