/**
 * @module API
 */
// TYPE
export type MatchSucess = [ true, {[key: string]: any} ];
export type MatchFail = [ false, {[key: string]: any} ];
export type MatchResult = MatchSucess | MatchFail | [ boolean, {[key: string]: any} ];
export type AnyFn = (...args: any[]) => any;
export type GuardFn = (...args: any[]) => boolean;

// INTERFACES
export interface Pattern {
  __meta__?: {
    version: number;
    source?: string;
  };
  root: AstNode;
}

export interface Location {
  start: {
    offset: number
  };
  end: {
    offset: number
  };
}

export interface AstNode {
  [key: string]: any;
  type: string;
  start?: number;
  end?: number;
  value?: any;
  bind?: string;
  alias?: string;
  key?: string;
  lhs?: AstNode;
  rhs?: AstNode;
}

export interface MatchItem {
  pattern: Pattern;
  predicate?: any;
  guard?: GuardFn;
}

export enum AstType {
  LITERAL = 'LITERAL',
  LIST = 'LIST',
  OBJECT = 'OBJECT',
  SEQUENCE = 'SEQUENCE',
  BIND = 'BIND',
  WILDCARD = 'WILDCARD',
  REST = 'REST',
  RANGE = 'RANGE',
  AS = 'AS',
  AND = 'AND',
  OR = 'OR',
  REGEXP = 'REGEXP'
}

export enum ErrorMessages {
  NO_PATTERN_DEFINED = 'No pattern defined',
  ONE_GUARD_PER_PATTERN = 'Only one guard per rule allowed',
  MISSING_PREDICATE = 'Missing callback function'
}
