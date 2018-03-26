import React from 'react';
import CycleSpan from './CycleSpan';

const CycleSpanList = (props) => {
	return <div>{
		props.data != null && getCycleSpans(
			props.data, 
			props.inventory,
			props.callback)
	}</div>;
}

const getCycleSpans = (data, inventory = {}, callback = null) => {

  // TODO: bad practice to use idx in a component array
  const cycleArray = preprocessData(data, inventory);
  return cycleArray.reduce((acc, cycle, idx) => {
	return acc.concat([ <CycleSpan 
		key={ 'cyclespan' + idx } 
		cycle={ cycle }
		callback={ callback }
	/> ]);
  }, []);

}

const resolveConditionals = (rawData, conditionals, inventory) => {

	if (conditionals == null)
		return rawData;

	const ids = conditionals.reduce((acc, conditional) => {
		if (matchesQuery(conditional.conditions, inventory))
			acc.relevant = acc.relevant.concat([ conditional.id ]);
		else
			acc.irrelevant = acc.irrelevant.concat([ conditional.id ]);
		return acc;
	}, { relevant: [], irrelevant: [] });

	const resolveTextWithConditional = (inText, conditionalId, conditionalText) => {
		if (conditionalId == null)
			return inText;
		if (!isValidString(conditionalText))
			return inText.replace(conditionalId, '');
		return inText.replace(conditionalId, conditionalText);
	}

	const resolvedData = Object.assign({}, rawData);

	const irrelevantIds = ids.irrelevant;
	resolvedData.text = irrelevantIds.reduce((text, id) => {
		return resolveTextWithConditional(text, id, '');
	}, resolvedData.text);

	const relevantIds = ids.relevant;
	resolvedData.text = relevantIds.reduce((text, id) => {
		// TODO: map this to optimize instead of running O(n) find by predicate?
		const conditionalIdx = conditionals.findIndex((cond) => { return cond.id === id; });
		const conditionalText = conditionalIdx >= 0
			? conditionals[conditionalIdx].text
			: '';
		return resolveTextWithConditional(text, id, conditionalText);
	}, resolvedData.text);

	return resolvedData;

}

const preprocessData = (rawData, inventory) => {
	
	const jsonData = resolveConditionals(rawData, rawData.conditionals, inventory);
	if (!isValidString(jsonData.text))
		return [];

	// Filter out cycles that do not appear and sort by order of appearance.
	const cycleIds = jsonData.cycles != null
		? Object.keys(jsonData.cycles)
			.filter(id => jsonData.text.indexOf(id) >= 0)
			.sort((a, b) => {
				return jsonData.text.indexOf(a) > jsonData.text.indexOf(b);
			})
		: [];

	// Only pure text, no cycles.
	if (cycleIds.length <= 0)
		return [ makeCycle(null, null, makeCycleData(jsonData.text)) ];

	const isValidIndex = (idx) => {
		return idx >= 0 && idx < cycleIds.length;
	}

	return cycleIds.reduce((acc, id, idx) => {

		// Start at the beginning or at the last cycle id position.
		const start = isValidIndex(idx - 1) 
			? jsonData.text.indexOf(cycleIds[idx - 1]) + cycleIds[idx - 1].length
			: 0;
		const end = isValidIndex(idx + 1)
			? jsonData.text.indexOf(cycleIds[idx + 1])
			: jsonData.text.length;

		const position = jsonData.text.indexOf(id);

		// Print before and after if it's the first, else print the after.
		const isFirstId = !isValidIndex(idx - 1);
		const before = isFirstId
			? jsonData.text.substr(start, position - start)
			: '';

		const after = jsonData.text.substr(
			position + id.length, end - position - id.length);

		const toConcat = [];

		if (before.length > 0)
			toConcat.push(makeCycle(null, null, makeCycleData(before)));

		const cycleData = jsonData.cycles[id];
		toConcat.push(makeCycle(id, getCycleIdx(id, cycleData, inventory), ...cycleData));

		if (after.length > 0)
			toConcat.push(makeCycle(null, null, makeCycleData(after)));

		return acc.concat(toConcat);

	}, []);
}

const getCycleIdx = (cycleId, cycleData, inventory) => {
	const desiredIdx = inventory.cycles != null ? inventory.cycles[cycleId] : 0;

	// Make sure that we have a valid cycle index.
	return getValidCycleIdx(cycleId, desiredIdx, cycleData, inventory);
}

const nextValidCycleIdx = (cycleId, currentIdx, cycleData, inventory) => {
	return getValidCycleIdx(cycleId, currentIdx + 1, cycleData, inventory);
}

const getValidCycleIdx = (cycleId, desiredIdx, cycleData, inventory) => {
	// Starting from the desired idx...
	for (let i = desiredIdx; i < cycleData.length; ++i) {
		const datum = cycleData[i];
		if (matchesQuery(datum.conditions, inventory))
			return i;
	}
	for (let j = 0; j < desiredIdx; ++j) {
		const datum = cycleData[j];
		if (matchesQuery(datum.conditions, inventory))
			return j;
	}
	return -1;
}

const makeCycle = (cycleId, cycleIdx, ...dataEntries) => {
	return {
		cycle_id: cycleId,
		cycle_idx: cycleIdx,
		data: [ ...dataEntries ]
	};
}

const makeCycleData = (text, actions = null, conditions = null) => {
	return {
		actions: actions,
		conditions: conditions,
		text: text
	};
}

const matchesQuery = (conditions, variables) => {
	// No conditions automatically matches,
	// but nothing to match against fails against something to match.
	if (conditions == null)
		return true;

	return Object.keys(conditions).reduce((isFulfilled, conditionId) => {

		const { type, val } = conditions[conditionId];
		const cmpVal = variables[conditionId];
		if (cmpVal == null)
			return false;

		switch (type) {
			case '>':
				return isFulfilled && cmpVal > val;
			case '<':
				return isFulfilled && cmpVal < val;
			case '>=':
				return isFulfilled && cmpVal >= val;
			case '<=':
				return isFulfilled && cmpVal <= val;
			case 'is':
			case '=':
			default:
				return isFulfilled && cmpVal === val;
		}

	}, true);
}

// Returns false if string is empty, null, or undefined.
const isValidString = (str) => {
	return str && str.length > 0;
}

// Callback to return updated inventory when advancing cycle
const handleNextCycle = (cycleId, currentCycleIdx, cycleData, inventory) => {
	const nextIdx = nextValidCycleIdx(cycleId, currentCycleIdx, cycleData, inventory);
	const newInventory = Object.assign({}, inventory);
	newInventory.cycles[cycleId] = nextIdx;
	return newInventory;
}

const cycleSpanUpdateFunction = (cycle, inventory, callback) => {
	return () => {
		callback(handleNextCycle(
			cycle.cycle_id, cycle.cycle_idx, cycle.data, inventory));
	}
}

export default CycleSpanList;
export { cycleSpanUpdateFunction };
