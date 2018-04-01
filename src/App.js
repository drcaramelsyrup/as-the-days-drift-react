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
			inventory: {},
			pid: props.pid
		};
	}

	advancePassage = (pid) => {
		// console.log(pid);
		this.setState({ pid: pid });
	}

	getPassageData(pid) {
		// console.log(this);
		// console.log(this.state.data[pid]);
		return this.state.data.hasOwnProperty(pid)
			? this.state.data[pid]
			: null;
	}

	renderPassage(pid) {
		const newPassage = (<Passage 
			data={ this.getPassageData(pid) } 
			inventory={ {} }
			advancePassage={ this.advancePassage } />);
		// console.log(newPassage);
		return newPassage;
	}

	render() {
		return (
			<div className='App'>
				{ this.state.data != null && this.renderPassage(this.state.pid) }
			</div>
		);
	}
}

export default App;
