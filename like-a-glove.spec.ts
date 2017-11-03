
import { match } from './like-a-glove';

describe('Pattern match', () => {
	it('Must be defined', () => {
		expect(match).toBeDefined();
	})

	it('basic function', () => {
		const getNumber = match()
			.with(2, () => 'ok')
			.with(8, () => 'oito').when((value) => typeof value === 'number')
			.with(9, () => 'nove').when((value) => typeof value === 'string')
			.with(10, () => 'dez', (value) => typeof value === 'number')
			.with(7, (v) => JSON.parse(undefined))
			.with('deep', (v) => match(v)
				.with('deep', () => 'way inside').end())
			.with(666).do(() => 'capiroto').when((value) => typeof value === 'string')
			.do(() => 'capiroto2').when((value) => typeof value === 'number')
			.with('capeta', () => 'OLHA')
			.else(() => 'nothing')
			.catch((e) => `Match error: ${e}`)
			.end();
		
		console.log('getNumber: ', getNumber(9));
		// console.log('single', match(2).with(2, () => 'It\'s alive!').end())
		
		// console.log('match: ', match());
		// console.log('match with: ', match().with(2));
		// console.log('getNumber', getNumber(2));
		
		// expect(getNumber(0)).toBeTruthy;
		// expect(getNumber(2)).toBe('2');
	});
});

/**
const Teste = match()
  .with('{x, y', (x, y) => x + y)
  .with(0, () => 0).when(isInt)
  .with('_', () => false)
  .else(() => false)
	.catch(() => console.log(error))

 */