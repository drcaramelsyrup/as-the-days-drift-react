import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import Passage from './Passage';
import CycleSpanList from './CycleSpanList';
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

		renderer.unmount();
	});

	it('renders with a simple passage id and text', () => {
		let text = 'test text';
		const pid = 215; 
		const dummyPassage = {
			pid: pid,
			text: text 
		};

		const passage = shallow(<Passage data={ dummyPassage } />);
		expect(passage.props().children).toEqual(
			makeExpectedCycleSpanList(
				makeExpectedListData(pid, null, null, null, text),
				{},
				passage.instance().updatePassage));
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

		const wrapper = shallow(<Passage 
			data={ makePassageData(data) } 
			inventory={ inventory} />);
		expect(wrapper.props().children).toEqual(
			makeExpectedCycleSpanList(
				data, 
				inventory,
				wrapper.instance().updatePassage));
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<Passage data={ snapshotData } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

describe('Passage - updatePassage', () => {

	const pid = 42;
	const text = 'update passage ';
	const dummyPassage = {
		pid: pid,
		text: text
	};

	it('renders and updates its inventory state', () => {
		const inventory = { conventional: 1 };
		const passage = shallow(<Passage 
			data={ dummyPassage }
			inventory={ inventory } />);
		const newInventory = { unconventional: 1 };
		passage.instance().updatePassage(newInventory);
		expect(passage.state().inventory).toEqual(newInventory);
	});

	it('renders and passes the update callback to children', () => {
		const inventory = { conventional: 1, practical: 2 };
		const passage = shallow(<Passage 
			data={ dummyPassage }
			inventory={ inventory } />);

		const newInventory = { unconventional: 1, romantic: 3 };
		passage.instance().updatePassage(newInventory);
		expect(passage.state().inventory).toEqual(newInventory);
	});

});

describe('Passage - advancePassage', () => {

	const data = { id: 42, text: 'test' };
	const passageData = makePassageData(data);
	const newData = { id: 45, text: 'new text' };
	const newPassageData = makePassageData(newData);

	it('renders and updates its passage data', () => {
		const inventory = { practical: 3 };

		const passage = shallow(<Passage
			data={ passageData }
			inventory={ inventory } />);
		expect(passage.state().data).toEqual(passageData);

		const newInventory = { unconventional: 2 };

		passage.instance().advancePassage(newPassageData, newInventory);
		expect(passage.state().data).toEqual(newPassageData);
		expect(passage.state().inventory).toEqual(newInventory);
	});

	it('renders and integrates inventory actions', () => {
		const inventory = { 
			actions: {
				romantic: 1,
				neurotic: 1
			},
			romantic: 2
		};
		const integratedInventory = {
			romantic: 3,
			neurotic: 1
		};

		const passage = shallow(<Passage
			data={ passageData }
			inventory={ inventory } />);

		passage.instance().advancePassage(newPassageData, inventory);
		expect(passage.state().data).toEqual(newPassageData);
		expect(passage.state().inventory).toEqual(integratedInventory);
	});

});

