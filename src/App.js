import React, { Component } from 'react';
import './App.css';

import Passage from './Passage';
import Background from './Background';
import { Surface } from 'gl-react-dom';
import { mergeActions } from './InventoryUtils';

/* Wishlist */
// - ImmutableJS
// - Redux (if necessary)

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			inventory: props.inventory || {},
			pid: props.pid,
			width: 0,
			height: 0
		};
	}

	componentDidMount() {
		this.updateBackgroundDimensions();
		window.addEventListener('resize', this.updateBackgroundDimensions);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateBackgroundDimensions);
	}

	updateBackgroundDimensions = () => {
		this.setState({ 
			width: window.innerWidth, 
			height: window.innerHeight 
		});
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
		return (<Passage 
			data={ this.getPassageData(pid) }
			inventory={ this.state.inventory }
			update={ this.updatePassage }
			advance={ this.advancePassage } />);
	}

	renderBackground(width, height) {
		return (
			<Surface width={ width } height={ height }>
				<Background 
					width={ width } height={ height }
					inventory={ this.state.inventory } />
			</Surface>
		);
	}

	render() {
		return (
			<div className='App'>
				{
					this.props.data != null && this.renderPassage(this.state.pid)
				}
				{
					!(this.props.noBackground != null && this.props.noBackground > 0)
						&& this.renderBackground(
							this.state.width, this.state.height,
							this.state.inventory)
				}
			</div>
		);
	}
}

export default App;
