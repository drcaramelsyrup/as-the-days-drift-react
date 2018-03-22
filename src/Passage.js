import React from 'react';
import CycleSpanList from './CycleSpanList';

const Passage = (props) => {
	return <div>{
		props.data != null && createCycleSpanList(
			createCycleSpanListData(
				props.data.pid, 
				props.data.actions, 
				props.data.conditionals, 
				props.data.cycles, 
				props.data.text),
			props.inventory)
	}</div>;
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

const createCycleSpanList = (data, inventory = {}) => {
	return <CycleSpanList data={ data } inventory={ inventory } />;
}

const drawPassage = () => {};

export default Passage;
export { drawPassage };
