import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { AstNode, MatchResult } from '../types';

export const wildcard = (input: any[], node: AstNode): MatchResult =>
  isType(input, node) ? SUCCESS : FAIL;
