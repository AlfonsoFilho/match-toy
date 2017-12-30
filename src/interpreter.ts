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

    const inputContainsRest = hasRest(node.values);

    // tslint:disable-next-line:max-line-length
    if (!is(input, 'Object') || (inputContainsRest ? Object.keys(input).length === 0 : Object.keys(input).length !== node.values.length)) {
      return FAIL;
    }

    if (inputContainsRest) {
      const restNode = getRest(node.values) || {} as AstNode;
      const expectedKeys = node.values.filter(({type}: AstNode) => type !== AstType.REST).map(({key}: AstNode) => key);
      const newObj: {[key: string]: any} = {};
      let restObj: {[key: string]: any} = {};

      Object.keys(input).forEach((key) => {
        if (contains(key, expectedKeys)) {
          newObj[key] = input[key];
        } else {
          restObj[key] = input[key];
        }
      });

      if (restNode.values) {
        const copy = restObj;
        restObj = {};
        Object.keys(copy).map((it) => {
          const [ status, result ] = interpreter({root: restNode}, [copy[it]]);
          if (status) {
            restObj[it] = result[restNode.name][0];
          }
        });
      }

      const result2 = Object.keys(input).map((inputKey: string) => {
        const it = node.values.find(({key}: AstNode) => key === inputKey);
        if (it) {
          return interpreter({ root: it}, newObj[inputKey]);
        } else {
          return undefined;
        }
      }).filter((it) => typeof it !== 'undefined');

      if (result2.every(([status, _]) => status === true)) {
        const resultArgs = result2.reduce((acc, it) => it ? ({ ...acc, ...it[1] }) : acc, {});
        const boundRest = restNode.name ? { [restNode.name]: restObj } : {};
        return [ true, { ...resultArgs, ...boundRest} ];
      } else {
        return FAIL;
      }

    } else {
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
    if (node.values) {
      const filteredInput = input.map((it) => interpreter({root: node.values}, it))
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
  },

  [AstType.WILDCARD]: (input: any[], node: AstNode): MatchResult => {
    return isType(input, node) ? SUCCESS : FAIL;
  },

  [AstType.RANGE]: (input: string | number, node: AstNode): MatchResult => {
    const { start = 0, end = 0 } = node;
    if (typeof input !== typeof start || typeof input !== typeof start) {
      return FAIL;
    }
    return input >= start && input <= end ? SUCCESS : FAIL;
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
  },

  [AstType.REGEXP]: (input: string, node: AstNode): MatchResult => {
    const result = input.match(node.value);
    if (result) {
      return [ true, { result } ];
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
