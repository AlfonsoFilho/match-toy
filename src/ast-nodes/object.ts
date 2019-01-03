import { FAIL } from '../constants';
import { addAlias, contains, getRest, is } from '../helpers';
import { AstNode, AstType, MatchResult } from '../types';

export const object = (input: { [key: string]: any }, node: AstNode, interpreter): MatchResult => {
  const restNode: AstNode = getRest(node.value) as AstNode;

  // tslint:disable-next-line:max-line-length
  if (
    !is(input, 'Object') ||
    (!!restNode ? Object.keys(input).length === 0 : Object.keys(input).length !== node.value.length)
  ) {
    return FAIL;
  }

  if (!!restNode) {
    const expectedKeys = node.value
      .filter(({ type }: AstNode) => type !== AstType.REST)
      .map(({ key }: AstNode) => key);

    const newObj: { [key: string]: any } = expectedKeys.reduce(
      (acc: { [key: string]: any }, key: string) => {
        if (typeof input[key] === 'undefined') {
          return false;
        }
        acc[key] = input[key];
        return acc;
      },
      {}
    );

    if (!newObj) {
      return FAIL;
    }

    let restObj: { [key: string]: any } = Object.keys(input).reduce(
      (acc: { [key: string]: any }, key) => {
        if (!contains(key, expectedKeys)) {
          acc[key] = input[key];
        }
        return acc;
      },
      {}
    );

    if (restNode.value) {
      const copy = restObj;
      restObj = {};
      Object.keys(copy).map(it => {
        const [status, restResult] = interpreter({ root: restNode }, [copy[it]]);
        if (status && restNode.bind) {
          restObj[it] = restResult[restNode.bind][0];
        }
      });
    }

    const result = Object.keys(input)
      .map((inputKey: string) => {
        const it = node.value.find(({ key }: AstNode) => key === inputKey);
        if (it) {
          return interpreter({ root: it }, newObj[inputKey]);
        } else {
          return undefined;
        }
      })
      .filter(it => typeof it !== 'undefined');

    if (result.every(([status, _]) => status === true)) {
      const resultArgs = result.reduce((acc, it) => (it ? { ...acc, ...it[1] } : acc), {});
      const boundRest = restNode.bind ? { [restNode.bind]: restObj } : {};
      return [true, { ...resultArgs, ...boundRest }];
    } else {
      return FAIL;
    }
  } else {
    const result = Object.keys(input).map((inputKey: string) => {
      const found = node.value.find(({ key }: AstNode) => key === inputKey);

      if (found) {
        return interpreter({ root: found }, input[inputKey]);
      }
      return FAIL;
    });

    if (result.every(([status, _]) => status === true)) {
      return [true, result.reduce((acc, it) => ({ ...acc, ...it[1] }), addAlias(node, input))];
    } else {
      return FAIL;
    }
  }
};
