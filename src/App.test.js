import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';
import App from './App';
import Passage from './Passage';
import data from './test_passage.json';

describe('App - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('App - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	it('renders as a div', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('contains a Passage element', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toContainEqual(<Passage />);
	});

	it('correctly sets data passed into the Passage element', () => {
		const testPassage = {
			pid: 0,
			text: 'test text'
		};
		renderer.render(<App data={ testPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toContainEqual(<Passage data={ testPassage } />);
	});

	// it('correctly converts whitespace to Unicode escape characters', () => {
	// 	const testText = 'test \ttext\n \t \r text';
	// 	const testTextUnicode = 'test \u0009text\u000a \u0009 \u000a text';
	// 	const testPassage = { pid: 0, text: testText };
	// 	const testPassageUnicode = { pid: 0, text: testTextUnicode };
	// 	renderer.render(<App data={ testPassage } />);
	// 	const output = renderer.getRenderOutput();
	// 	expect(output.props.children).toContainEqual(
	// 		<Passage data={ testPassageUnicode } />);
		
	// });


});
