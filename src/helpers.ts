import { AstNode, AstType } from './types';

export const is = (obj: any, type: string | string[]): boolean => {

  const check = (o: any, t: string) => Object.prototype.toString.call(o) === `[object ${t}]`;

  if (typeof type === 'string') {
    return check(obj, type);
  }

  if (Array.isArray(type)) {
    return type.some((typeItem) => check(obj, typeItem));
  }

  return false;
};

export const reverse = (arr: any[] = []) => ([] as any).concat(arr).reverse();

export const contains = (value: any, arr: any[]) => (Array as any).prototype.includes.call(arr, value);

export const isNullable = (value: any) => {
  if (typeof value === 'undefined' || value === null) {
    return true;
  }
  if (is(value, ['String', 'Array'])) {
    return value.length === 0;
  }
  if (is(value, 'Object')) {
    return Object.keys(value).length === 0;
  }
  if (typeof value === 'number') {
    return value === 0;
  }
  return false;
};

export const isType = (value: any, { typeOf }: any) => {
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

export const getRest = (list: AstNode[] = []) => list.find(({ type }) => type === AstType.REST);

export const addProp = (prop: string) => (node: AstNode, value: any): object =>
  node[prop] ? { [node[prop]]: value } : {};

export const addBind = addProp('bind');

export const addAlias = addProp('alias');
