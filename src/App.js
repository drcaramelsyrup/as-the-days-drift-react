import React, { Component } from 'react';
import './App.css';

import Passage from './Passage';
import Background from './Background';
import { Surface } from 'gl-react-dom';
import { mergeActions, allExcept } from './InventoryUtils';
import { getCycleSpansToRender, getCycleIdx } from './CycleUtils';

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
		const { cycles, actions } = this.state.inventory;

		const mergedInventory = mergeActions(
			allExcept(this.state.inventory, 'cycles', 'actions'),
			actions
		);

		// TODO:
		// This is such a kludge-y way to get the initial render.
		// Really, the data should get processed in this level if we aren't going to use Redux.
		const cycleSpans = getCycleSpansToRender(
			this.getPassageData(pid), mergedInventory);
		const initialActions = cycleSpans.reduce((acc, cycleSpan) => {
			const { actions } = cycleSpan.data[
				getCycleIdx(
					cycleSpan.cycle_id, 
					cycleSpan.data, 
					mergedInventory
				)
			];
			return mergeActions(acc, actions);
		}, {});

		this.setState({
			pid: pid,
			inventory: {
				...mergedInventory,
				cycles: cycles,
				actions: initialActions
			}
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
			<div className='BackgroundSurface'>
				<Surface width={ width } height={ height }>
					<Background 
						width={ width } height={ height }
						inventory={ this.state.inventory } />
				</Surface>
			</div>
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
