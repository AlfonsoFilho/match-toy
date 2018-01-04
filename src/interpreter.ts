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

    const restNode = getRest(node.value);

    // tslint:disable-next-line:max-line-length
    if (!is(input, 'Object') || (!!restNode ? Object.keys(input).length === 0 : Object.keys(input).length !== node.value.length)) {
      return FAIL;
    }

    if (!!restNode) {

      const expectedKeys = node.value.filter(({type}: AstNode) => type !== AstType.REST).map(({key}: AstNode) => key);
      const newObj: {[key: string]: any} = {};
      let restObj: {[key: string]: any} = {};

      Object.keys(input).forEach((key) => {
        if (contains(key, expectedKeys)) {
          newObj[key] = input[key];
        } else {
          restObj[key] = input[key];
        }
      });

      if (restNode.value) {
        const copy = restObj;
        restObj = {};
        Object.keys(copy).map((it) => {
          const [ status, restResult ] = interpreter({root: restNode}, [copy[it]]);
          if (status) {
            restObj[it] = restResult[restNode.name][0];
          }
        });
      }

      const result = Object.keys(input).map((inputKey: string) => {
        const it = node.value.find(({key}: AstNode) => key === inputKey);
        if (it) {
          return interpreter({ root: it}, newObj[inputKey]);
        } else {
          return undefined;
        }
      }).filter((it) => typeof it !== 'undefined');

      if (result.every(([status, _]) => status === true)) {
        const resultArgs = result.reduce((acc, it) => it ? ({ ...acc, ...it[1] }) : acc, {});
        const boundRest = restNode.name ? { [restNode.name]: restObj } : {};
        return [ true, { ...resultArgs, ...boundRest} ];
      } else {
        return FAIL;
      }

    } else {

      const result = Object.keys(input).map((inputKey: string, index) => {

        const found = node.value.find(({key}) => key === inputKey);

        if (found) {
          return interpreter({root: found}, input[inputKey]);
        }
        return FAIL;
      });

      if (result.every(([status, _]) => status === true)) {
        return [ true, result.reduce((acc, it) => ({ ...acc, ...it[1] }), {}) ];
      } else {
        return FAIL;
      }
    }
  },

  [AstType.LIST]: (input: any[], node: AstNode): MatchResult => {

    const inputContainsRest = hasRest(node.value);

    if (!is(input, 'Array') || (inputContainsRest ? input.length === 0 : input.length !== node.value.length)) {
      return FAIL;
    }

    if (!input.every((it) => isType(it, node))) {
      return FAIL;
    }

    if (inputContainsRest) {
      const restNode = getRest(node.value) || {} as AstNode;
      if (!restNode.name) {
        return SUCCESS;
      }
      const nthBefore = node.value.findIndex(({ type }: AstNode) => type === AstType.REST);
      const nthAfter = reverse(node.value).findIndex(({ type }: AstNode) => type === AstType.REST);

      input = [
        ...input.slice(0, nthBefore),
        input.slice(nthBefore, input.length - nthAfter),
        ...input.slice(input.length - nthAfter, input.length)
      ];
    }

    const matchResult = input.map((inputValue, index) => {
      return interpreter({root: node.value[index]}, inputValue);
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

  // [AstType.AS]: (input: any[], node: AstNode): MatchResult => {
  //   const [ status, result ] = interpreter({root: node.value}, input);
  //   return [ status, {...result, [node.name]: (Object as any ).value(result)} ];
  // },

  [AstType.REST]: (input: any[], node: AstNode): MatchResult => {
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
    // console.log('ARGS', input, node);
    const childIndex = node.value.findIndex(({type}) => type === AstType.ARGUMENTS);

    let childResut = [true, {}];

    if (childIndex >= 0) {
      console.log('FILHO')
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
      console.log('FAIL', input.length, node.value.length)
      return FAIL;
    }
    const result = node.value.map((it: AstNode, index: number) => interpreter({ root: it }, input[index]))
                .concat([childResut]);
                console.log('RESULT', result);
    if (result.every(([status, _]: MatchResult) => status === true)) {
      const bind = node.name ? { [node.name]: input } : {};
      return [ true, result.reduce((acc: object, it: MatchResult) => ({ ...acc, ...it[1], ...bind }), {}) ];
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
