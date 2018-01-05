import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const and = (input: any[], node: AstNode): MatchResult => {
  const { lhs, rhs } = node;
  const [ lhsStatus, lhsResult ] = interpreter({root: lhs}, input);
  const [ rhsStatus, rhsResult ] = interpreter({root: rhs}, input);

  if (lhsStatus && rhsStatus) {
    return [ true, { ...lhsResult, ...rhsResult }];
  } else {
    return FAIL;
  }
};
