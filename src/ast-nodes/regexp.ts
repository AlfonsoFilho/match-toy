import { FAIL } from '../constants';
import { AstNode, MatchResult } from '../types';

export const regexp = (input: string, node: AstNode): MatchResult => {
  const result = input.match(node.value);
  if (result) {
    return [true, { result }];
  } else {
    return FAIL;
  }
};
