import { compile } from './compiler';
import { interpreter } from './interpreter';
import { AnyFn, ErrorMessages, GuardFn, MatchItem } from './types';

export class Matcher {

  private initialValues: any;
  private matchList: MatchItem[];
  private elseValue: AnyFn;
  private catchCallback: any;

  constructor(value?: any[]) {
    this.initialValues = value;
    this.matchList = [];
    this.elseValue = () => undefined;
    this.catchCallback = this.defaultCatchCallback;
  }

  private defaultCatchCallback = (e: Error) => `Match error: ${e}`;

  private runMatch(value: any[]): any {

    const { matchCallback, matchArgs } = this.matchList.reduce((state, {pattern, predicate, guard = () => true}) => {

      if (state.done) {
        return state;
      }

      if (typeof predicate === 'undefined') {
        throw new Error(ErrorMessages.MISSING_PREDICATE);
      }

      const [ resultStatus, result ] = interpreter(pattern, value);

      if (resultStatus !== false && guard(result)) {
        state.matchCallback = predicate;
        state.matchArgs = result;
        state.done = true;
      }

      return state;
    }, { matchCallback: this.elseValue, matchArgs: undefined as any, done: false });

    try {
      return typeof matchCallback === 'function' ? matchCallback(matchArgs) : matchCallback;
    } catch (error) {
      try {
        return this.catchCallback(error);
      } catch (error) {
        return this.defaultCatchCallback(error);
      }
    }
  }

  public case(pattern: string, predicate?: any, guard?: GuardFn) {
    this.matchList.push({ pattern: compile(pattern), predicate, guard });
    return this;
  }

  public with(pattern: string, predicate?: any, guard?: GuardFn) {
    return this.case(pattern, predicate, guard);
  }

  public do(predicate: any): Matcher {
    this.matchList[this.matchList.length - 1].predicate = predicate;
    return this;
  }

  public when(func: GuardFn): Matcher {
    const lastRule = this.matchList[this.matchList.length - 1];
    if (typeof lastRule.guard !== 'undefined') {
      throw new Error(ErrorMessages.ONE_GUARD_PER_PATTERN);
    }
    lastRule.guard = func;
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

  public return(...value: any[]) {
    this.initialValues = value;
    return this.runMatch(this.initialValues);
  }

  public end()  {
    if (this.matchList.length === 0) {
      throw new Error(ErrorMessages.NO_PATTERN_DEFINED);
    }

    if (this.initialValues.length > 0) {
      return this.runMatch(this.initialValues);
    }

    return (...value: any[]) => this.runMatch(value);
  }
}

export const match = (...args: any[]) => new Matcher(args);
export default match;
