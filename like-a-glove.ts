
type BoolFn = (...args: any[]) => boolean;

type AnyFn = (...args: any[]) => any;

type MatchItem = {
	pattern: any,
	predicate: AnyFn | undefined,
	guard: BoolFn
}


class Matcher {

	private elseValue: AnyFn = () => undefined;
	private matchList: MatchItem[] = [];
	private catchCallback: any = (e: Error) => `Match error: ${e}`;
	private initialValues: any;

	constructor(value?: any) {
		this.initialValues = value;
	}

	with(pattern: any, predicate?: AnyFn, guard: BoolFn = () => true) {
		this.matchList.push({pattern, predicate, guard});
		return this;
	}

	do(predicate: AnyFn) {
		this.matchList[this.matchList.length - 1]['predicate'] = predicate;
		return this;
	}
	
	when(func: BoolFn) {
		this.matchList[this.matchList.length - 1]['guard'] = func;
		return this;
	};
	
	else(func: AnyFn) {
		this.elseValue = func
		return this;
	};
	
	catch(func: AnyFn) {
		this.catchCallback = func;
		return this;
	}

	runMatch(value: any) {
		const matchCallback: AnyFn = this.matchList.reduce((acc, {pattern, predicate, guard}) => {
			if(pattern === value && guard(value) && typeof predicate === 'function') {
				acc =  predicate;
			}
			return acc;
		}, this.elseValue);

		try {
			return matchCallback(value);
		} catch (error) {
			return this.catchCallback(error);
		}
	}

	end() {
		if(this.initialValues) {
			return this.runMatch(this.initialValues);
		}
		return (value: any) => this.runMatch(value);
	}
}

export const match = (initalValue?:any) => new Matcher(initalValue);
/**
const Teste = match()
  .with('{x, y', (x, y) => x + y)
  .with(0, () => 0).when(isInt)
  .with('_', () => false)
  .else(() => false)
	.catch(() => console.log(error))
	.end()

 */