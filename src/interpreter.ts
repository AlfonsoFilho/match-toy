import {
  and,
  bind,
  list,
  literal,
  object,
  or,
  range,
  regexp,
  rest,
  sequence,
  wildcard
} from './ast-nodes/index';
import { AstType, MatchResult, Pattern } from './types';

const astNodesMapping: { [key: string]: any } = {
  [AstType.LITERAL]: literal,
  [AstType.OBJECT]: object,
  [AstType.LIST]: list,
  [AstType.BIND]: bind,
  [AstType.REST]: rest,
  [AstType.WILDCARD]: wildcard,
  [AstType.RANGE]: range,
  [AstType.SEQUENCE]: sequence,
  [AstType.OR]: or,
  [AstType.AND]: and,
  [AstType.REGEXP]: regexp
};

export const interpreter = (pattern: Pattern, input: any[]): MatchResult => {
  const { root } = pattern;
  const { type } = root;

  return astNodesMapping[type](input, root, interpreter);
};
