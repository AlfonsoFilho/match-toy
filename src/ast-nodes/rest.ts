import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, MatchResult } from '../types';

export const rest = (input: any[], node: AstNode): MatchResult => {
  if (node.value) {
    const filteredInput = input.map((it) => interpreter({root: node.value}, it))
                  .filter(([status, _]) => status)
                  .map(([_, value]) => value);

    if (filteredInput.length > 0) {
      return [ true, { [node.name]: filteredInput } ];
    } else {
      return [false, {}];
    }
  } else {
    return [ true, { [node.name]: input } ];
  }
};
