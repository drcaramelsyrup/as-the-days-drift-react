import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Passage from './Passage';
import CycleSpanList from './CycleSpanList';
import ResponseList from './ResponseList';
import snapshotData from './test_passage.json';

describe('Passage - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Passage />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

const makePassageData = (data) => {
	const newData = Object.assign({}, data);
	newData.pid = newData.id;
	return newData;
}

describe('Passage - Render', () => {

	const makeExpectedListData = (id, actions, conditionals, cycles, text) => {
		return {
			actions: actions,
			conditionals: conditionals,
			cycles: cycles,
			id: id,
			text: text
		};	
	}

	const makeExpectedCycleSpanList = (data, inventory, callback) => {
		return <CycleSpanList 
			data={ data } 
			inventory={ inventory }
			callback={ callback } />;
	}

	const makeExpectedResponseList = (data, inventory, callback) => {
		return <ResponseList 
			data={ data }
			inventory={ inventory }
			callback={ callback } />;
	}

	it('does not render if not given data', () => {
		const renderer = new ShallowRenderer();

		renderer.render(<Passage />);
		const output = renderer.getRenderOutput();
		expect(output).toBe(false);

		renderer.unmount();
	});

	it('renders as a div container', () => {
		const renderer = new ShallowRenderer();

		const dummyPassage = {
			pid: 215,
			text: 'test text' 
		};
		renderer.render(<Passage data={ dummyPassage }/>);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
		expect(output.props.className).toBe('Passage');

		renderer.unmount();
	});

	it('renders with a simple passage id and text', () => {
		const text = 'test text';
		const pid = 215; 
		const dummyPassage = {
			id: pid,
			text: text 
		};

		const passage = shallow(<Passage data={ dummyPassage } />);
		expect(passage.props().children).toEqual([
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				{},
				passage.props().update), 
			null
		]);
	});

	it('renders with a simple passage id, text, and responses', () => {
		const text = 'test text';
		const pid = 215; 
		const responses = [{ target: 0, text: 'text' }];
		const dummyPassage = {
			id: pid,
			text: text, 
			responses: responses
		};

		const passage = shallow(<Passage data={ dummyPassage } />);
		expect(passage.props().children).toEqual([
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				{},
				passage.props().update),
			makeExpectedResponseList(
				responses,
				{},
				passage.props().advance)
		]);
	});

	it('passes along the advance callback to the ResponseList', () => {
		const text = 'test text';
		const pid = 13; 
		const dummyPassage = {
			id: pid,
			text: text, 
			responses: {}
		};
		const advancePassage = (num) => { return true; };

		const passage = shallow(<Passage 
			data={ dummyPassage } advance={ advancePassage }/>);
		expect(passage.props().children).toEqual([
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				{},
				passage.props().update),
			makeExpectedResponseList(
				{},
				{},
				advancePassage)
		]);
	});

	it('renders and passes along data fields', () => {
		const inventory = { trinkets: 2 };
		const pid = 0;
		const responses = [
			{ text: 'response', target: 1 }, { text: 'response2', target: 3 }
		];
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
			id: pid,
			responses: responses
		};

		const wrapper = shallow(<Passage 
			data={ makePassageData(data) } 
			inventory={ inventory } />);
		expect(wrapper.props().children).toEqual([
			makeExpectedCycleSpanList(
				makeExpectedListData(
					data.id, 
					data.actions, 
					data.conditionals, 
					data.cycles, 
					data.text), 
				inventory,
				wrapper.props().update),
			makeExpectedResponseList(
				responses, 
				inventory,
				wrapper.props().advance)
		]);
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(
			<Passage data={ snapshotData } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

