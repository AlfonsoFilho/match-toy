
import { compile } from './compiler';
import { interpreter } from './interpreter';
import { AnyFn, BoolFn, MatchItem, MatchResult } from './types';

class Matcher {

  private initialValues: any;
  private matchList: MatchItem[];
  private elseValue: AnyFn;
  private catchCallback: any;

  constructor(value?: any) {
    this.initialValues = value;
    this.matchList = [];
    this.elseValue = () => undefined;
    this.catchCallback = (e: Error) => `Match error: ${e}`;
  }

  private evaluatePattern(pattern: any, values: any[]): MatchResult {

    if (pattern.__meta__ && pattern.__meta__.version === 1) {
      return interpreter(pattern, values);
    }

    if (pattern === values[0]) {
      return [ true, [values[0]]];
    }

    return [ false, {} ];
  }

  private runMatch(value: any[]): void {

    const { matchCallback, matchArgs } = this.matchList.reduce((state, {pattern, predicate, guard}) => {

      if (state.done) {
        return state;
      }

      const [ resultStatus, result ] = this.evaluatePattern(pattern, value);

      if (resultStatus !== false && guard(value) && typeof predicate === 'function') {
        state.matchCallback = predicate;
        state.matchArgs = result;
        state.done = true;
      }

      return state;
    }, { matchCallback: this.elseValue, matchArgs: undefined as any, done: false });

    try {
      return matchCallback(matchArgs);
    } catch (error) {
      return this.catchCallback(error);
    }
  }

  public with(pattern: string, predicate?: AnyFn, guard: BoolFn = () => true) {
    this.matchList.push({ pattern: compile(pattern), predicate, guard });
    return this;
  }

  public do(predicate: AnyFn): Matcher {
    this.matchList[this.matchList.length - 1].predicate = predicate;
    return this;
  }

  public when(func: BoolFn): Matcher {
    this.matchList[this.matchList.length - 1].guard = func;
    return this;
  }

  public else(func: AnyFn): Matcher {
    this.elseValue = func;
    return this;
  }

  public catch(func: AnyFn): Matcher {
    this.catchCallback = func;
    return this;
  }

  public end()  {
    if (this.initialValues.length > 0) {
      return this.runMatch(this.initialValues);
    }
    return (...value: any[]) => this.runMatch(value);
  }
}

export const match = (...args: any[]) => new Matcher(args);
