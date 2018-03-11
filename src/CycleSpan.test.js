import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import CycleSpan from './CycleSpan';

describe('CycleSpan - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<CycleSpan />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('CycleSpan - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	it('renders a span', () => {
		renderer.render(<CycleSpan />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('span');
	});

	it('renders text passed in with the correct section key', () => {
		const text = 'test text';
		renderer.render(<CycleSpan text={ text } />);
		const output = renderer.getRenderOutput();

		const outputChildren = output.props.children;
		const sectionKey = '0';
		const expectedChildren = [
			<span key={ 'text' + sectionKey }>{ text }</span>
		];

		expect(outputChildren).toEqual(expectedChildren);
		expect(JSON.stringify(outputChildren)).toEqual(
			JSON.stringify(expectedChildren));
	});

	it('renders whitespace correctly', () => {

		const firstParagraph = 'This is a paragraph.';
		const firstSectionKey = '0';
		const secondParagraph = 'Another paragraph - wow ';
		const secondSectionKey = '1';

		const text = '\t' + firstParagraph + '\n\t' + secondParagraph;
		renderer.render(<CycleSpan text={ text } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual([
			<span key={ 'text' + firstSectionKey }>{ text }</span>
		]);

	});

});

