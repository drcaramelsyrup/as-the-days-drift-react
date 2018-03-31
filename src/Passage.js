import React from 'react';
import CycleSpanList from './CycleSpanList';
import ResponseList from './ResponseList';
import { mergeActions } from './InventoryUtils';

class Passage extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			inventory: props.inventory,
			callback: props.callback
		};
	}

	setPassage = (newData, newInventory) => {
		const { actions, ...inventory } = newInventory;

		this.setState({ 
			data: newData, 
			inventory: mergeActions(inventory, actions) 
		});
	}

	updatePassage = (newInventory) => {
		this.setState({ inventory: newInventory });
	}

	render() {
		return this.state.data != null && (<div>
			{
				createCycleSpanList(
					createCycleSpanListData(
						this.state.data.pid, 
						this.state.data.actions, 
						this.state.data.conditionals, 
						this.state.data.cycles, 
						this.state.data.text),
					this.state.inventory || {},
					this.updatePassage) 
			}
			<ResponseList />
		</div>);
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

const createCycleSpanList = (data, inventory, callback) => {
	return <CycleSpanList 
		data={ data } 
		inventory={ inventory } 
		callback={ callback } />;
}

export default Passage;
