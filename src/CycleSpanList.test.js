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

	const makeExpectedCycleData = (actions, conditions, text) => {
		return {
			actions: actions,
			conditions: conditions,
			text: text
		};
	}

	const makeExpectedCycleSpan = (cycleId, cycleIdx, keyNum, ...data) => {
		return <CycleSpan key={ 'cyclespan' + keyNum } cycle={
			{ 
				cycle_id: cycleId, 
				cycle_idx: cycleIdx,
				data: [...data]
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
		const spanIdx = 0;
		expect(output.props.children).toEqual(
			[ makeExpectedCycleSpan(null, null, spanIdx,
				makeExpectedCycleData(null, null, text)) ]);
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
			text: textBeforeLink + cycleId + textAfterLink
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();

		let spanIdx = 0;
		const cycleIdx = 0;
		expect(output.props.children).toEqual([
			makeExpectedCycleSpan(null, null, spanIdx++,
				makeExpectedCycleData(null, null, textBeforeLink)),
			makeExpectedCycleSpan(cycleId, cycleIdx, spanIdx++,
				makeExpectedCycleData(null, null, testLinkText)),
			makeExpectedCycleSpan(null, null, spanIdx++,
				makeExpectedCycleData(null, null, textAfterLink))
		]);
	});

	it('renders a cycling link and can swap between cycles', () => {
		const firstLinkText = 'this is a cycling link';
		const secondLinkText = 'this is the second cycling link';
		const cycleId = '_cycle_test';
		const cycleIdx = 1;

		const dummyPassageData = {
			cycles: {
				[cycleId]: [{
					actions: null,
					conditions: null,
					text: firstLinkText
				}, {
					actions: null,
					conditions: null,
					text: secondLinkText
				}]
			},
			text: cycleId
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } inventory={
			{
				cycles: {
					[cycleId]: cycleIdx
				}
			}
		} />);
		const output = renderer.getRenderOutput();

		const spanIdx = 0;
		expect(output.props.children).toEqual([
			makeExpectedCycleSpan(cycleId, cycleIdx, spanIdx, 
				makeExpectedCycleData(null, null, firstLinkText),
				makeExpectedCycleData(null, null, secondLinkText))
		]);
	});

	describe('Conditions', () => {
		const cycleId = '_cycle_condition_test';
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
		const conditionText = 'test condition';
		const testText = 'test render';
		const dummyPassageData = {
			pid: 0,
			cycles: {
				[cycleId]: [
					{
						actions: actions,
						conditions: conditions,
						text: conditionText
					},
					{
						actions: actions,
						conditions: null,
						text: testText
					}
				]
			},
			text: cycleId
		};

		const conditionalCycleIdx = 0;
		const nonconditionalCycleIdx = 1;
		const spanIdx = 0;

		const spanWithExpectedIdx = (cycleIdx) => {
			return makeExpectedCycleSpan(
				cycleId,
				cycleIdx,
				spanIdx,
				makeExpectedCycleData(
					actions, conditions, conditionText),
				makeExpectedCycleData(
					actions, null, testText));
		}

		it('does not render a span with conditions without an inventory', () => {
			renderer.render(<CycleSpanList data={ dummyPassageData } />);
			const output = renderer.getRenderOutput();
			expect(output.props.children).toEqual(
				[ spanWithExpectedIdx(nonconditionalCycleIdx) ]);
		});

		it('does not render a span with conditions when unsatisfied', () => {
			renderer.render(<CycleSpanList data={ dummyPassageData } inventory={
				{ neuroticism: 5 }
			} />);
			const outputNotSatisfied = renderer.getRenderOutput();
			expect(outputNotSatisfied.props.children).toEqual(
				[ spanWithExpectedIdx(nonconditionalCycleIdx) ]);
		});

		it('renders a span with conditions when satisfied', () => {
			renderer.render(<CycleSpanList data={ dummyPassageData } inventory={
				{ neuroticism: 3 }
			} />);
			const outputSatisfied = renderer.getRenderOutput();
			expect(outputSatisfied.props.children).toEqual(
				[ spanWithExpectedIdx(conditionalCycleIdx) ]);
		});
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<CycleSpanList data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

