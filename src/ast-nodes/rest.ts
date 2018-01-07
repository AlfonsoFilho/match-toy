import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const rest = (input: any[], node: AstNode): MatchResult => {
  // console.log('REST', input, node);
  if (node.value) {
    const filteredInput = input.map((it) => interpreter({root: node.value}, it))
                  .filter(([status, _]) => status)
                  .map(([_, value]) => value);

    if (filteredInput.length > 0) {
      return [ true, { [node.bind]: filteredInput } ];
    } else {
      return [false, {}];
    }
  } else {
    return [ true, { [node.bind]: input } ];
  }
};
