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

	const makeExpectedCycleSpanList = (data, inventory, callback = null) => {
		return <CycleSpanList 
			data={ data } 
			inventory={ inventory }
			callback={ callback } />;
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

	it('renders and passes along data fields', () => {
		const inventory = { trinkets: 2 };
		const pid = 0;
		const data = {
			actions: {
				learned: 2
			},
			conditionals: {
				conditions: {
					partner: {
						type: 'is',
						val: 'sam'
					}
				},
				id: '_cond_text_0',
				text: 'conditional '
			},
			cycles: {
				_cycle_example: [
					{
						actions: null,
						text: 'test cycle'
					},
					{
						actions: {
							career: 'journalist',
						},
						text: 'test cycle 2'
					}
				]
			},
			text: 'test text',
			id: pid
		};
		const dummyPassage = Object.assign({}, data);
		dummyPassage.pid = pid;

		renderer.render(<Passage data={ dummyPassage } inventory={ inventory } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			makeExpectedCycleSpanList(data, inventory));

	});

	it('renders and passes along a callback', () => {
		const pid = 42;
		const text = 'callback should be drawPassage';
		const dummyPassage = {
			pid: pid,
			text: text
		};
		const inventory = { conventional: 1 };
		const drawPassage = () => { return false; };
		renderer.render(<Passage 
			data={ dummyPassage } 
			inventory={ inventory }
			callback={ drawPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				inventory, drawPassage));
		
	})

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<Passage data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

