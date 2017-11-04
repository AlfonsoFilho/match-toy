import { contains, is, reverse } from './helpers';
import { AstNode, AstType, MatchFail, MatchResult, MatchSucess, Pattern } from './types';

const FAIL: MatchFail      = [ false, {} ];
const SUCCESS: MatchSucess = [ true, {} ];

const getRest = (list: AstNode[] = []) => list.find(({ type }) => type === AstType.REST);

const hasRest = (list: AstNode[]) => !!getRest(list);

const isNullable = (value: any) => {
  if (typeof value === 'undefined' || value === null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.length === 0;
  }
  if (typeof value === 'number') {
    return value === 0;
  }
  return !!value;
};

const isType = (value: any, { typeOf }: any) => {
  if (typeof typeOf === 'undefined' || typeOf === null) {
    return true;
  }

  if (typeOf === 'Nullable') {
    return isNullable(value);
  }

  if (contains(typeOf, ['String', 'Number', 'Boolean', 'Array', 'Object', 'Function', 'Null', 'Undefined'])) {
    return is(value, typeOf);
  }

  if (typeof value === 'object') {
    return typeOf === value.constructor.toString().match(/(?!function)\s+(?:\w+)(?!\s\()/)[0].trim();
  }

  return false;
};

const nodeReader: {[key: string]: any } = {

  [AstType.LITERAL]: (input: any[], node: AstNode): MatchResult => {
    return node.value === input && isType(input, node) ? SUCCESS : FAIL;
  },

  [AstType.OBJECT]: (input: {[key: string]: any}, node: AstNode): MatchResult => {

    if (!is(input, 'Object') || Object.keys(input).length !== node.values.length) {
      return FAIL;
    }

    const result = Object.keys(input).map((inputKey: string, index) => {
      if (!contains(inputKey, node.values.map(({key}: AstNode) => key))) {
        return FAIL;
      }
      return interpreter({root: node.values[index]}, input[inputKey]);
    });

    if (result.every(([status, _]) => status === true)) {
      return [ true, result.reduce((acc, it) => ({ ...acc, ...it[1] }), {}) ];
    } else {
      return FAIL;
    }
  },

  [AstType.LIST]: (input: any[], node: AstNode): MatchResult => {

    const inputContainsRest = hasRest(node.values);

    if (!is(input, 'Array') || (inputContainsRest ? input.length === 0 : input.length !== node.values.length)) {
      return FAIL;
    }

    if (!input.every((it) => isType(it, node))) {
      return FAIL;
    }

    if (inputContainsRest) {
      const restNode = getRest(node.values) || {} as AstNode;
      if (!restNode.name) {
        return SUCCESS;
      }
      const nthBefore = node.values.findIndex(({ type }: AstNode) => type === AstType.REST);
      const nthAfter = reverse(node.values).findIndex(({ type }: AstNode) => type === AstType.REST);

      input = [
        ...input.slice(0, nthBefore),
        input.slice(nthBefore, input.length - nthAfter),
        ...input.slice(input.length - nthAfter, input.length)
      ];
    }

    const matchResult = input.map((inputValue, index) => {
      return interpreter({root: node.values[index]}, inputValue);
    });

    if (matchResult.every(([status, _]) => status === true)) {
      return [ true, matchResult.reduce((acc, it) => ({ ...acc, ...it[1] }), {}) ];
    } else {
      return FAIL;
    }
  },

  [AstType.BIND]: (input: any[], node: AstNode): MatchResult => {
    return isType(input, node) ? [ true, { [node.value]: input } ] : FAIL;
  },

  [AstType.AS]: (input: any[], node: AstNode): MatchResult => {
    const [ status, result ] = interpreter({root: node.value}, input);
    return [ status, {...result, [node.name]: (Object as any ).values(result)} ];
  },

  [AstType.REST]: (input: any[], node: AstNode): MatchResult => {
    return [ true, { [node.name]: input } ];
  },

  [AstType.WILDCARD]: (input: any[], node: AstNode): MatchResult => {
    return isType(input, node) ? SUCCESS : FAIL;
  },

  [AstType.RANGE]: (input: any[], node: AstNode): MatchResult => {
    const { start = 0, end = 0 } = node;
    return typeof input === 'number' && input >= start && input <= end ? SUCCESS : FAIL;
  },

  [AstType.ARGUMENTS]: (input: any[], node: AstNode): MatchResult => {

    if (input.length !== node.values.length) {
      return FAIL;
    }
    const result = node.values.map((it: AstNode, index: number) => interpreter({ root: it }, input[index]));
    if (result.every(([status, _]: MatchResult) => status === true)) {
      return [ true, result.reduce((acc: object, it: MatchResult) => ({ ...acc, ...it[1] }), {}) ];
    } else {
      return FAIL;
    }
  },

  [AstType.OR]: (input: any[], node: AstNode): MatchResult => {

    const { lhs, rhs } = node;
    const [ lhsStatus, lhsResult ] = interpreter({root: lhs}, input);
    const [ rhsStatus, rhsResult ] = interpreter({root: rhs}, input);

    if (lhsStatus || rhsStatus) {
      return [ true, lhsStatus ? lhsResult : rhsResult ];
    } else {
      return FAIL;
    }
  },

  [AstType.AND]: (input: any[], node: AstNode): MatchResult => {
    const { lhs, rhs } = node;
    const [ lhsStatus, lhsResult ] = interpreter({root: lhs}, input);
    const [ rhsStatus, rhsResult ] = interpreter({root: rhs}, input);

    if (lhsStatus && rhsStatus) {
      return [ true, { ...lhsResult, ...rhsResult }];
    } else {
      return FAIL;
    }
  }
};

export const interpreter = (pattern: Pattern, input: any[]): MatchResult => {

  const { root } = pattern;
  const { type } = root;

  return nodeReader[type](input, root);
};
