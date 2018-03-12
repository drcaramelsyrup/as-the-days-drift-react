import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
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

	it('renders as a div container', () => {
		renderer.render(<Passage />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('renders with a simple passage id and text', () => {
		const dummyPassage = {
			pid: 215,
			text: 'test text'
		};

		renderer.render(<Passage data={ dummyPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			<CycleSpan text={ dummyPassage.text } />);
	});

	it('renders a simple cycling link', () => {
		const textBeforeLink = 'test before ';
		const testLinkText = 'this is a cycling link';
		const textAfterLink = ' test after';

		const dummyPassage = {
			pid: 0,
			cycles: {
				_cycle_test: [
					{
						text: testLinkText
					}
				]
			},
			text: textBeforeLink + '_cycle_test' + textAfterLink
		};

		renderer.render(<Passage data={ dummyPassage } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual([
			<CycleSpan text={ textBeforeLink } cycles={ [] } />,
			<CycleSpan text={ testLinkText } cycles={ dummyPassage.cycles } />,
			<CycleSpan text={ textAfterLink } cycles={ [] } />
		]);
	});

	it('renders with a complete data passage', () => {
		renderer.render(<Passage data={ data } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			<CycleSpan text={ data.text } />);
	});

});

