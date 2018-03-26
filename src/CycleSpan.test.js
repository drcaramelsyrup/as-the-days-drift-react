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

	const makeCycle = (cycleId, cycleIdx, ...data) => {
		return {
			cycle_id: cycleId,
			cycle_idx: cycleIdx,
			data: [...data]
		}
	}

	const makeCycleData = (text, actions = null, conditions = null) => {
		return {
			actions: actions,
			conditions: conditions,
			text: text
		};
	}

	const makeSpan = (cycle) => {
		return (<span className='cycle'>{ cycle.data[cycle.cycle_idx].text }</span>);
	}

	it('does not render a span without data', () => {
		renderer.render(<CycleSpan />);
		const output = renderer.getRenderOutput();
		expect(output).toEqual(false);
	});

	it('renders a span with the correct class', () => {
		const cycleId = '_cycle_test';
		const cycleIdx = 0;
		const text = 'test text';
		const cycle = makeCycle(cycleId, cycleIdx, makeCycleData(text));

		renderer.render(<CycleSpan cycle={ cycle } />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('span');
		expect(output.props.className).toBe('cycle');
	});

	it('renders a cycle correctly', () => {
		const cycleId = '_cycle_test';
		const cycleIdx = 0;
		const text = 'test text';
		const actions = { romantic: 1 };
		const conditions = {
			neurotic: {
				type: '>',
				val: 2
			}
		};
		const cycle = makeCycle(cycleId, cycleIdx,
			makeCycleData(text, actions, conditions));
		renderer.render(<CycleSpan cycle={ cycle } />);
		const output = renderer.getRenderOutput();
		expect(output).toEqual(makeSpan(cycle));
	});

	/* DEPRECATED */
	// it('renders text passed in with the correct section key', () => {
	// 	const text = 'test text';
	// 	renderer.render(<CycleSpan text={ text } />);
	// 	const output = renderer.getRenderOutput();

	// 	const outputChildren = output.props.children;
	// 	const sectionKey = '0';
	// 	const expectedChildren = [
	// 		<span key={ 'text' + sectionKey }>{ text }</span>
	// 	];

	// 	expect(outputChildren).toEqual(expectedChildren);
	// 	expect(JSON.stringify(outputChildren)).toEqual(
	// 		JSON.stringify(expectedChildren));
	// });

	// it('renders whitespace correctly as unicode characters', () => {
	// 	const firstParagraph = 'This is a paragraph.';
	// 	const firstSectionKey = '0';
	// 	const secondParagraph = 'Another paragraph - wow ';
	// 	const secondSectionKey = '1';

	// 	const text = '\t' + firstParagraph + '\n\t' + secondParagraph + '\r';
	// 	renderer.render(<CycleSpan text={ text } />);
	// 	const output = renderer.getRenderOutput();
	// 	expect(output.props.children).toEqual([
	// 		<span key={ 'text' + firstSectionKey }>{ text }</span>
	// 	]);
	// });

});

