import React, { Component } from 'react';
import './App.css';
import Passage from './Passage';
import { mergeActions } from './InventoryUtils';

/* Wishlist */
// - ImmutableJS
// - Redux (if necessary)

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			inventory: props.inventory || {},
			pid: props.pid
		};
	}

	advancePassage = (pid) => {
		const { actions, ...inventory } = this.state.inventory;

		this.setState({
			pid: pid,
			inventory: mergeActions(inventory, actions) 
		});
	}

	updatePassage = (newInventory) => {
		this.setState({ inventory: newInventory });
	}

	getPassageData(pid) {
		return this.props.data.hasOwnProperty(pid)
			? this.props.data[pid]
			: null;
	}

	renderPassage(pid) {
		const newPassage = (<Passage 
			data={ this.getPassageData(pid) }
			inventory={ this.state.inventory }
			update={ this.updatePassage }
			advance={ this.advancePassage } />);
		return newPassage;
	}

	render() {
		return (
			<div className='App'>
				{ this.props.data != null && this.renderPassage(this.state.pid) }
			</div>
		);
	}
}

export default App;
