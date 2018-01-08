import { addBind } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

const mappingPattern = (input: any[] = [], node: AstNode) =>
  input
    .map((it) => interpreter({root: node.value}, it))
    .filter(([status, _]) => status)
    .map(([_, value]) => value);

export const rest = (input: any[], node: AstNode): MatchResult => {
  if (node.value) {
    const mappingResult = mappingPattern(input, node);

    if (mappingResult.length > 0) {
      return [ true, addBind(node, mappingResult) ];
    } else {
      return [false, {}];
    }
  } else {
    return [ true, addBind(node, input) ];
  }
};
