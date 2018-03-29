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
			data: props.data
		};
	}

	loadDataFromFile(file) {
		this.setState({
			data: JSON.parse(file)
		});
	}

	setData(data) {
		this.setState({ data: data });
	}
	
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<Passage data={ this.state.data } />
			</div>
		);
	}
}

// const unicodifyWhitespace = (data) => {
// 	// if array, check if string, replace whitespace
// 	// if string, replace whitespace

// 	const unicodified = (text) => {
// 		const replaceTabs = text.replace('\t', '\u0009');
// 		const replaceNewlines = replaceTabs.replace('\n', '\u000a');
// 		return replaceNewlines.replace('\r', '\u000a');
// 	};



// 	const deepWalk = (data) => {
// 		// if (data is array)
// 		const keys = Object.keys(data);

// 		if (keys.length === 1)


// 		return keys.map((key) => {
// 			return deepWalk(data[key]);
// 		});
// 	}
// 	return Object.keys(data).map((key) => {

// 	});


// }

// const deepTransform = (data, transformation) => {

// 	if (Array.isArray(data)) {
// 		return data.reduce((datum) => {
// 			return deepTransform(datum, transformation);
// 		});
// 	}

// 	if (typeof(data) === 'string') {
// 		return transformation(data);
// 	}

// 	const keys = Object.keys(data);

// 	return keys.map((key) => {
// 		return deepTransform(data[key], transformation);
// 	});
// }

export default App;
