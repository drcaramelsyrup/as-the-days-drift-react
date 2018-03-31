import React from 'react';
import { matchesQuery } from './InventoryUtils';

const ResponseList = (props) => {
	return props.data != null
		&& <div>{ makeResponses(props.data, props.inventory) }</div>;
}

const makeResponses = (data, inventory) => {
	return data.reduce((list, datum, idx) => {
		const matches = matchesQuery(datum.conditions, inventory);
		return matches 
			? list.concat([
				<Response key={ 'response'+idx } data={ datum } /> ])
			: list;
	}, []);
}

export default ResponseList;