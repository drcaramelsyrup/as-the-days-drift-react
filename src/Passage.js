import React from 'react';
import CycleSpanList from './CycleSpanList';

class Passage extends React.Component {

	render() {
		return <div>{
			this.props.data != null && createCycleSpanList(
				createCycleSpanListData(
					this.props.data.pid, 
					this.props.data.actions, 
					this.props.data.conditionals, 
					this.props.data.cycles, 
					this.props.data.text),
				this.props.inventory,
				this.props.callback)
		}</div>;
	}

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

const createCycleSpanList = (data, inventory = {}, callback = null) => {
	return <CycleSpanList 
		data={ data } 
		inventory={ inventory } 
		callback={ callback } />;
}

const drawPassage = (newInventory) => {
	return <Passage />;
	newInventory.actions;
};

// Callback to return updated inventory when advancing cycle
// const handleNextCycle = (cycleId, currentIdx, cycleData = [], inventory = {}) => {
// 	const nextIdx = nextValidCycleIdx(cycleId, currentIdx + 1, cycleData, inventory)
// 	const newInventory = inventory.acc([]);
// 	newInventory[cycleId] = nextIdx;
// 	return newInventory;
// }

export default Passage;
export { drawPassage };
