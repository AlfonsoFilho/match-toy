import { FAIL } from '../constants';
import { addAlias } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const or = (input: any[], node: AstNode): MatchResult => {

  const { lhs, rhs } = node;
  const [ lhsStatus, lhsResult ] = interpreter({root: (lhs as AstNode)}, input);
  const [ rhsStatus, rhsResult ] = interpreter({root: (rhs as AstNode)}, input);

  if (lhsStatus || rhsStatus) {
    return [ true, { ...(lhsStatus ? lhsResult : rhsResult), ...addAlias(node, input)} ];
  } else {
    return FAIL;
  }
};
