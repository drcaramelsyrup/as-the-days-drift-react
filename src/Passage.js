import React from 'react';
import CycleSpanList from './CycleSpanList';
import ResponseList from './ResponseList';
import { mergeActions } from './InventoryUtils';

const Passage = (props) => {
	const inventory = props.inventory || {};
	return props.data != null && (<div>
		{
			createCycleSpanList(
				createCycleSpanListData(
					props.data.id, 
					props.data.actions, 
					props.data.conditionals, 
					props.data.cycles, 
					props.data.text),
				inventory,
				props.update) 
		}
		{
			// We should not display responses if there are none for now
			props.data.responses != null 
				? createResponseList(
					props.data.responses,
					inventory,
					props.advance)
				: null
		}
	</div>);
}

const createCycleSpanListData = (id, actions, conditionals, cycles, text) => {
	const maybe = (input) => {
		return input == null ? null : input;
	}
	return {
		actions: maybe(actions),
		conditionals: maybe(conditionals),
		cycles: maybe(cycles),
		id: maybe(id),
		text: maybe(text)
	};
}

const createCycleSpanList = (data, inventory, callback) => {
	// console.log(data);
	return (<CycleSpanList 
		data={ data } 
		inventory={ inventory } 
		callback={ callback } />);
}

const createResponseList = (responses, inventory, callback) => {
	return <ResponseList 
		data={ responses }
		inventory={ inventory }
		callback={ callback } />;
}

export default Passage;
