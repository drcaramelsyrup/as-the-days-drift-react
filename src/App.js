import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Passage from './Passage';

/* Wishlist */
// - ImmutableJS
// - Redux (if necessary)

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			pid: props.pid
		};
	}

	advancePassage(pid) {
		this.setState({ pid: pid });
	}

	getPassageData(pid) {
		return this.state.data.hasOwnProperty(pid)
			? this.state.data[pid]
			: null;
	}

	render() {
		return (
			<div className='App'>
				{ this.state.data != null 
					&& <Passage data={ this.getPassageData(this.state.pid) } /> }
			</div>
		);
	}
}

export default App;
