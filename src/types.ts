/**
 * @module API
 */
// TYPE
export type MatchSucess = [ true, {[key: string]: any} ];
export type MatchFail = [ false, {[key: string]: any} ];
export type MatchResult = MatchSucess | MatchFail | [ boolean, {[key: string]: any} ];
export type AnyFn = (...args: any[]) => any;
export type BoolFn = (...args: any[]) => boolean;
// export type Literal = number | string;

// INTERFACES
export interface Pattern {
  __meta__?: {
    version: number;
    source?: string;
  };
  root: AstNode;
}

export interface AstNode {
  type: string;
  // kind: string;
  start?: number;
  end?: number;
  // raw?: string;
  value?: any;
  name?: any;
  key?: any;
  values?: any;
  lhs?: any;
  rhs?: any;
}

export interface MatchItem {
  pattern: Pattern;
  predicate?: AnyFn;
  guard?: BoolFn;
}

export enum AstType {
  LITERAL = 'LITERAL',
  LIST = 'LIST',
  OBJECT = 'OBJECT',
  ARGUMENTS = 'ARGUMENTS',
  BIND = 'BIND',
  WILDCARD = 'WILDCARD',
  REST = 'REST',
  RANGE = 'RANGE',
  AS = 'AS',
  AND = 'AND',
  OR = 'OR'
}

export enum ErrorMessages {
  NO_PATTERN_DEFINED = 'No pattern defined',
  ONE_GUARD_PER_PATTERN = 'Only one guard per rule allowed',
  MISSING_PREDICATE = 'Missing callback function'
}
