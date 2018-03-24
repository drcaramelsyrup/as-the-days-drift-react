import React from 'react';
import CycleSpanList from './CycleSpanList';

class Passage extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			inventory: props.inventory,
			callback: props.callback
		};
	}

	render() {
		return <div>{
			this.state.data != null && createCycleSpanList(
				createCycleSpanListData(
					this.state.data.pid, 
					this.state.data.actions, 
					this.state.data.conditionals, 
					this.state.data.cycles, 
					this.state.data.text),
				this.state.inventory,
				this.state.callback)
		}</div>;
	}

	advancePassage = (newData, newInventory) => {

	}

	updatePassage = (newInventory) => {
		// this.setState({ inventory: newInventory });
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

// Callback to return updated inventory when advancing cycle
// const handleNextCycle = (cycleId, currentIdx, cycleData = [], inventory = {}) => {
// 	const nextIdx = nextValidCycleIdx(cycleId, currentIdx + 1, cycleData, inventory)
// 	const newInventory = inventory.acc([]);
// 	newInventory[cycleId] = nextIdx;
// 	return newInventory;
// }

export default Passage;
