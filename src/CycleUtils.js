/**
 * Helper functions to preprocess and create cycle link data objects.
 * Dependency on InventoryUtils.
 */
 
import { allExcept, mergeActions, removeActions, matchesQuery } from './InventoryUtils';

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

const updatedInventoryForCycle = (cycleId, cycleIdx, cycleData, inventory) => {
	const oldCycles = inventory.cycles || {};
	const currentCycleIdx = oldCycles.hasOwnProperty(cycleId)
		? oldCycles[cycleId]
		: 0;

	const allExceptCycleId = allExcept(oldCycles, cycleId);
	const newCycles = oldCycles.hasOwnProperty(cycleId)
		? { ...allExceptCycleId, [cycleId]: cycleIdx }
		: { ...oldCycles, [cycleId]: cycleIdx };

	const newActions = mergeActions(
		removeActions(inventory.actions, cycleData[currentCycleIdx].actions),
		cycleData[cycleIdx].actions);

	const { actions, cycles } = inventory;
	return { 
		...allExcept(inventory, 'actions', 'cycles'),
		cycles: newCycles,
		actions: newActions
	};
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
	if (desiredIdx == null)
		desiredIdx = 0;
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

// Returns false if string is empty, null, or undefined.
const isValidString = (str) => {
	return str && str.length > 0;
}

const getCycleSpansToRender = (rawData, inventory) => {
	
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

export { makeCycle, makeCycleData, updatedInventoryForCycle, getCycleSpansToRender, getCycleIdx };
