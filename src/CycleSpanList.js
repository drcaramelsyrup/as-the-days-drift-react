import React from 'react';
import CycleSpan from './CycleSpan';

const CycleSpanList = (props) => {
	return <div>{
    	props.data != null && getCycleSpans(
    		props.data, 
    		props.inventory)
  	}</div>;
}

const preprocessData = (jsonData, inventory = {}) => {
  const textList = [];

  // TODO: more graceful way to check for properties?
  if (jsonData.cycles == null)
    return [ makeCycle(null, null, makeCycleData(jsonData.text)) ];

  const cycleIds = Object.keys(jsonData.cycles).sort((a, b) => {
    return jsonData.text.indexOf(a) > jsonData.text.indexOf(b);
  });

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

const getCycleIdx = (cycleId, cycleData = [], inventory = {}) => {
	const desiredIdx = inventory.cycles != null ? inventory.cycles[cycleId] : 0;

	// Make sure that we have a valid cycle index.
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

const getCycleSpans = (data, inventory = {}) => {

  // TODO: bad practice to use idx in a component array
  const cycleArray = preprocessData(data, inventory);
  return cycleArray.reduce((acc, cycle, idx) => {
    return acc.concat([ <CycleSpan key={ 'cyclespan' + idx } cycle={ cycle } /> ]);
  }, []);

}

const matchesQuery = (conditions = {}, variables = {}) => {
	// No conditions automatically matches,
	// but nothing to match against fails against something to match.
	if (conditions == null)
		return true;
	if (variables == null)
		return false;

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

		return false;

	}, true);
}

// Callback to return updated inventory when advancing cycle
const handleNextCycle = (cycle_id, cycle_idx, inventory) => {
	const newInventory = inventory.acc([]);
	newInventory.cycle_id = cycle_idx;
	return newInventory;
}

const createCycleSpan = (text, cycle = []) => {
  return <CycleSpan cycle={ cycle }/>;
}

export default CycleSpanList;
