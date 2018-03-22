import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import Passage from './Passage';
import CycleSpanList from './CycleSpanList';
import data from './test_passage.json';

describe('Passage - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Passage />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('Passage - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	const makeExpectedListData = (id, actions, conditionals, cycles, text) => {
		return {
			actions: actions,
			conditionals: conditionals,
			cycles: cycles,
			id: id,
			text: text
		};	
	}

	const makeExpectedCycleSpanList = (data, inventory) => {
		return <CycleSpanList data={ data } inventory={ inventory } />;
	}

	it('renders as a div container', () => {
		renderer.render(<Passage />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('renders with a simple passage id and text', () => {
		let text = 'test text';
		const pid = 215; 
		const dummyPassage = {
			pid: pid,
			text: text 
		};

		renderer.render(<Passage data={ dummyPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				{}));
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<Passage data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

