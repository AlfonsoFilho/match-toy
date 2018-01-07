import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const or = (input: any[], node: AstNode): MatchResult => {

  const { lhs, rhs } = node;
  const [ lhsStatus, lhsResult ] = interpreter({root: lhs}, input);
  const [ rhsStatus, rhsResult ] = interpreter({root: rhs}, input);

  const args = {};

  if (node.alias) {
    args[node.alias] = input;
  }

  if (lhsStatus || rhsStatus) {
    return [ true, { ...(lhsStatus ? lhsResult : rhsResult), ...args} ];
  } else {
    return FAIL;
  }
};
