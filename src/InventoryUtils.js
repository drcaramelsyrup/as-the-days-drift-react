/* Helper functions for manipulating inventory objects. */

const mergeActions = (actions, newActions) => {
	if (newActions == null)
		return actions;

	const currentActions = Object.assign({}, actions);
	return Object.keys(newActions).reduce(
		(ret, key) => {
			const val = newActions[key];
			if (ret.hasOwnProperty(key)) {
				if (isNumeric(val))
					return { ...allExcept(ret, key), [key]: ret[key] + val };
				return { ...allExcept(ret, key), [key]: val };
			}
			return { ...ret, [key]: val };
		}, currentActions);
}

const removeActions = (actions, actionsToRemove) => {
	if (actionsToRemove == null)
		return actions;
	if (actions == null)
		return {};

	return Object.keys(actions).reduce(
		(ret, key) => {
			if (actionsToRemove.hasOwnProperty(key)) {
				const val = actionsToRemove[key];
				if (isNumeric(val))
					return { ...allExcept(ret, key), [key]: actions[key] - val };
				return { ...ret };
			}
			return { ...ret, [key]: actions[key] };
		}, {});
}

const matchesQuery = (conditions, variablesToCheck) => {
	// No conditions automatically matches,
	// but nothing to match against fails against something to match.
	if (conditions == null)
		return true;

	return Object.keys(conditions).reduce((isFulfilled, conditionId) => {

		const { type, val } = conditions[conditionId];
		const cmpVal = variablesToCheck[conditionId];
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

const allExcept = (inObject, ...excludedKeys) => {
	return Object.keys(inObject)
		.filter(key => !excludedKeys.includes(key))
		.reduce((acc, key) => { 
			return { ...acc, [key]: inObject[key] }; 
		}, {});
}

const isNumeric = (number) => {
	return !isNaN(parseFloat(number)) && isFinite(number);
}

export { mergeActions, removeActions, matchesQuery, allExcept };
