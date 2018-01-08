import { FAIL} from '../constants';
import { addAlias } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const and = (input: any[], node: AstNode): MatchResult => {
  const { lhs, rhs } = node;
  const [ lhsStatus, lhsResult ] = interpreter({ root: (lhs as AstNode ) }, input);
  const [ rhsStatus, rhsResult ] = interpreter({ root: (rhs as AstNode ) }, input);

  if (lhsStatus && rhsStatus) {
    return [ true, { ...lhsResult, ...rhsResult, ...addAlias(node, input) }];
  } else {
    return FAIL;
  }
};
