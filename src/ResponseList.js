import React from 'react';
import Response from './Response';
import { matchesQuery } from './InventoryUtils';

const ResponseList = (props) => {
	return props.data != null && 
		(<div>{ makeResponses(props.data, props.inventory, props.callback) }</div>);
}

const makeResponses = (data, inventory, callback) => {
	return data.reduce((list, datum, idx) => {
		const matches = matchesQuery(datum.conditions, inventory);
		return matches 
			? list.concat(
				[ (<Response
					key={ 'response'+idx } 
					data={ datum } 
					callback={ callback } />) ])
			: list;
	}, []);
}

export default ResponseList;