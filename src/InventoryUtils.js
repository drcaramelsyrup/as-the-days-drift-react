/* Helper functions for manipulating inventory objects. */

const mergeActions = (actions, newActions) => {
	if (newActions == null)
		return actions;

	const currentActions = Object.assign({}, actions);
	return Object.keys(newActions).reduce(
		(ret, key) => {
			const val = newActions[key];
			if (ret.hasOwnProperty(key) && isNumeric(val))
				ret[key] += val;
			else
				ret[key] = val;
			return ret;
		}, currentActions);
}

const removeActions = (actions, actionsToRemove) => {
	if (actionsToRemove == null)
		return actions;
	if (actions == null)
		return {};

	return Object.keys(actions).reduce(
		(ret, key) => {
			const retVal = ret[key];
			if (actionsToRemove.hasOwnProperty(key)) {
				const val = actionsToRemove[key];
				if (isNumeric(val))
					ret[key] = actions[key] - val;
				return ret;
			}
			ret[key] = retVal;
			return ret;
		}, {});
}

const isNumeric = (number) => {
	return !isNaN(parseFloat(number)) && isFinite(number);
}

export { mergeActions, removeActions };
