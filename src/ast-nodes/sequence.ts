import { FAIL, SUCCESS } from '../constants';
import { isType } from '../helpers';
import { interpreter } from '../interpreter';
import { AstNode, AstType, MatchResult } from '../types';

export const sequence = (input: any[], node: AstNode): MatchResult => {
  // console.log('ARGS', input, node);
  const childIndex = node.value.findIndex(({type}) => type === AstType.SEQUENCE);

  let childResut = [true, {}];

  if (childIndex >= 0) {
    // console.log('FILHO');
    // console.log('SUb args before', node.value, childIndex);
    const childArgs = node.value.splice(childIndex, 1)[0];
    // console.log('SUb args after', node.value);
    // console.log('SUb args after', childArgs);
    const size = childArgs.value.length;
    const subInput = input.slice(0, size);
    input = input.slice(size, input.length);
    // console.log('new input', subInput,  input);
    childResut = interpreter({root: childArgs}, subInput);
    // console.log('CHILD R', childResut)
  }

  if (input.length !== node.value.length) {
    // console.log('FAIL', input.length, node.value.length);
    return FAIL;
  }
  const result = node.value.map((it: AstNode, index: number) => interpreter({ root: it }, input[index]))
              .concat([childResut]);
  // console.log('RESULT', result);
  if (result.every(([status, _]: MatchResult) => status === true)) {
    const bind = node.name ? { [node.name]: input } : {};
    return [ true, result.reduce((acc: object, it: MatchResult) => ({ ...acc, ...it[1], ...bind }), {}) ];
  } else {
    return FAIL;
  }
};
