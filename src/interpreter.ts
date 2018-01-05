import { and, bind, list, literal, object, or, range, regexp, rest, sequence, wildcard } from './ast-nodes';
import { FAIL, SUCCESS } from './constants';
import { contains, is, isType, reverse } from './helpers';
import { AstNode, AstType, MatchFail, MatchResult, MatchSucess, Pattern } from './types';

const nodeReader: {[key: string]: any } = {

  [AstType.LITERAL]: literal,

  [AstType.OBJECT]: object,

  [AstType.LIST]: list,

  [AstType.BIND]: bind,

  // [AstType.AS]: (input: any[], node: AstNode): MatchResult => {
  //   const [ status, result ] = interpreter({root: node.value}, input);
  //   return [ status, {...result, [node.name]: (Object as any ).values(result)} ];
  // },

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

  return nodeReader[type](input, root);
};
