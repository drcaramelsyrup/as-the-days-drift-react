import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import CycleSpanList from './CycleSpanList';
import CycleSpan from './CycleSpan';
import data from './test_cyclespanlist.json';

describe('CycleSpanList - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<CycleSpanList />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('CycleSpanList - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	const makeExpectedCyclingSpan = (cycleId, actions, conditions, text, keyNum = 0) => {
		return <CycleSpan key={ 'cyclespan' + keyNum } cycle={
			{ 
				cycle_id: cycleId, 
				data: [{
					actions: actions,
					conditions: conditions,
					text: text
				}]
			}
		} />
	}

	it('renders as a div container', () => {
		renderer.render(<CycleSpanList />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('renders with simple text', () => {
		let text = 'test text';
		const dummyPassageData = {
			text: text 
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			[ makeExpectedCyclingSpan(null, null, null, text) ]);
	});

	it('renders a simple cycling link', () => {
		const textBeforeLink = 'test before ';
		const testLinkText = 'this is a cycling link';
		const textAfterLink = ' test after';
		const cycleId = '_cycle_test';

		const dummyPassageData = {
			cycles: {
				[cycleId]: [
					{
						actions: null,
						conditions: null,
						text: testLinkText
					}
				]
			},
			text: textBeforeLink + '_cycle_test' + textAfterLink
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();

		let spanIdx = 0;
		expect(output.props.children).toEqual([
			makeExpectedCyclingSpan(null, null, null, textBeforeLink, spanIdx++),
			makeExpectedCyclingSpan(cycleId, null, null, testLinkText, spanIdx++),
			makeExpectedCyclingSpan(null, null, null, textAfterLink, spanIdx++)
		]);
	});

	it('renders a conditional cycling link', () => {
		const cycleId = '_cycle_conditional_test';
		const actions = {
			romantic: '1',
			complacent: '2'
		};
		const conditions = {
			neuroticism: {
				type: '<',
				val: '5'
			}
		};
		const testText = 'test render';

		const dummyPassageData = {
			pid: 0,
			cycles: {
				[cycleId]: [
					{
						actions: actions,
						conditions: conditions,
						text: testText
					}
				]
			},
			text: cycleId
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();

		const spanIdx = 0;
		expect(output.props.children).toEqual([
			makeExpectedCyclingSpan(cycleId, actions, conditions, testText, spanIdx)
		]);
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<CycleSpanList data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

