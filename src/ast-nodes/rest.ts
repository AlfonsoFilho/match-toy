import { addBind } from '../helpers';
import { AstNode, MatchResult } from '../types';

const mappingPattern = (input: any[], node: AstNode, interpreter) =>
  input
    .map(it => interpreter({ root: node.value }, it))
    .filter(([status, _]) => status)
    .map(([_, value]) => value);

export const rest = (input: any[], node: AstNode, interpreter): MatchResult => {
  if (node.value) {
    const mappingResult = mappingPattern(input, node, interpreter);

    if (mappingResult.length > 0) {
      return [true, addBind(node, mappingResult)];
    } else {
      return [false, {}];
    }
  } else {
    return [true, addBind(node, input)];
  }
};
