/* Helper functions for managing traits inherent to ATDD. */

const TRAITS = [
	'calm',
	'temperamental',
	'complacent',
	'neurotic',
	'practical',
	'romantic',
	'entitled',
	'indebted',
	'passive',
	'resolute',
];

const TRAIT_SCORE = {
	'temper': ['temperamental', '-', 'calm'],
	'turbulence': ['neurotic', '-', 'complacent'],
	'worldliness': ['practical', '-', 'romantic'],
	'entitlement': ['entitled', '-', 'indebted'],
	'assertiveness': ['resolute', '-', 'passive'],
};

const pullTraits = (collection) => {
	const collectionKeys = Object.keys(collection);
	const traits = collectionKeys.filter((key) => {
		return TRAITS.includes(key);
	});
	return traits.reduce((acc, trait) => {
		return Object.assign({ [trait]: collection[trait] }, acc);
	}, {});
}

const pullTraitValue = (collection, traitName) => {
	return collection.hasOwnProperty(traitName)
		? collection[traitName]
		: null;
}

const getTraitScore = (collection, traitName) => {
	if (!TRAIT_SCORE.hasOwnProperty(traitName))
		return 0;
	return TRAIT_SCORE[traitName].reduce((acc, symbol) => {
		if (!TRAITS.includes(symbol)) {
			if (symbol === '-')
				return { score: acc.score, isNextPositive: false };
		}
		return {
			score: acc.isNextPositive
				? acc.score + collection[symbol]
				: acc.score - collection[symbol], 
			isNextPositive: true
		};
	}, { score: 0, isNextPositive: true }).score;
}

export { TRAITS, TRAIT_SCORE, pullTraits, pullTraitValue };
