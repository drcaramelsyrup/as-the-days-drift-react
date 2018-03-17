import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import Passage from './Passage';
import CycleSpan from './CycleSpan';
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

	const makeExpectedCyclingSpan = (cycleId, actions, text, keyNum = 0) => {
		return <CycleSpan key={ 'cyclespan' + keyNum } cycle={
			{ 
				cycle_id: cycleId, 
				data: [{
					actions: actions,
					text: text
				}]
			}
		} />
	}

	it('renders as a div container', () => {
		renderer.render(<Passage />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('renders with a simple passage id and text', () => {
		let text = 'test text';
		const dummyPassage = {
			pid: 215,
			text: text 
		};

		renderer.render(<Passage data={ dummyPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			[ makeExpectedCyclingSpan(null, null, text) ]);
	});

	it('renders a simple cycling link', () => {
		const textBeforeLink = 'test before ';
		const testLinkText = 'this is a cycling link';
		const textAfterLink = ' test after';
		const cycleId = '_cycle_test';

		const dummyPassage = {
			pid: 0,
			cycles: {
				[cycleId]: [
					{
						actions: null,
						text: testLinkText
					}
				]
			},
			text: textBeforeLink + '_cycle_test' + textAfterLink
		};

		renderer.render(<Passage data={ dummyPassage } />);
		const output = renderer.getRenderOutput();

		let spanIdx = 0;
		expect(output.props.children).toEqual([
			makeExpectedCyclingSpan(null, null, textBeforeLink, spanIdx++),
			makeExpectedCyclingSpan(cycleId, null, testLinkText, spanIdx++),
			makeExpectedCyclingSpan(null, null, textAfterLink, spanIdx++)
		]);
	});

	it('renders a conditional cycling link', () => {
		const dummyPassage = {

		};
	});

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<Passage data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

