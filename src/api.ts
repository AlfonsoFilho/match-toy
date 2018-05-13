import { compile } from './compiler';
import { interpreter } from './interpreter';
import { ErrorMessages } from './types';

const defaultCatchFn = (e: Error) => `Match error: ${e}`;
const defaultGuardFn = () => true;

function makeMatchFunc(casesList: any[], elseFn, catchFn) {
  return (...values) => {

    const { matchedFn, matchedArgs } = casesList.reduce((state, { pattern, predicate, guard = defaultGuardFn }) => {
      if (state.done) {
        return state;
      }

      const [status, result] = interpreter(pattern, values);

      if (status !== false && guard(result)) {
        state.matchedFn = predicate;
        state.matchedArgs = result;
        state.done = true;
      }

      return state;
    }, { matchedFn: elseFn, matchedArgs: undefined, done: false });

    try {
      return typeof matchedFn === 'function'
        ? matchedFn(matchedArgs)
        : matchedFn;
    } catch (error) {
      try {
        return catchFn(error);
      } catch (error) {
        return defaultCatchFn(error);
      }
    }
  };
}

function apiFactory() {

  let casesList = [];
  let elseFn = () => undefined;
  let catchFn = defaultCatchFn;

  return {
    case(pattern: string, predicate, guard?: any) {
      casesList.push({ pattern: compile(pattern), predicate, guard });
      return this;
    },
    when(fn) {
      const lastCase = casesList[casesList.length - 1];
      if (typeof lastCase.guard !== 'undefined') {
        throw new Error(ErrorMessages.ONE_GUARD_PER_PATTERN);
      }
      lastCase.guard = fn;
      return this;
    },
    else(fn) {
      elseFn = fn;
      return this;
    },
    catch(fn) {
      catchFn = fn;
      return this;
    },
    end() {
      if (casesList.length === 0) {
        throw new Error(ErrorMessages.NO_PATTERN_DEFINED);
      }
      const matchFn = makeMatchFunc([...casesList], elseFn, catchFn);
      casesList = [];
      return matchFn;
    },
    return(...values) {
      return this.end()(...values);
    }
  };
}

export const match = apiFactory();

export default match;
