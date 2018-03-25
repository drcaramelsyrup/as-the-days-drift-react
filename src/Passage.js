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

	// advancePassage = (newData, newInventory) => {}
	updatePassage = (newInventory) => {
		if (this.state.callback != null)
			this.state.callback();
		this.setState({ inventory: newInventory });
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
				this.updatePassage)
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

export default Passage;
