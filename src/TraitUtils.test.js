import { TRAITS, TRAIT_SCORE, pullTraits } from './TraitUtils';

describe('Traits', () => {

	it('correctly pulls traits from a collection', () => {
		const inventory = TRAITS.concat(['rand1', 'rand2'])
			.reduce((acc, trait) => {
				return Object.assign({[trait]: Math.random()}, acc);
			}, {});
		const traits = pullTraits(inventory);
		const pulledKeys = Object.keys(traits);
		pulledKeys.forEach((key) => {
			expect(TRAITS).toContain(key);
			expect(inventory[key]).toEqual(traits[key]);
		});
	});

});
