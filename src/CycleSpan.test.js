import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';

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

	const makeSpan = (cycle, callback = null) => {
		return (<span className='cycle' onClick={ callback }>
			{ cycle.data[cycle.cycle_idx].text }
		</span>);
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

	it('handles a click event by calling the given callback', () => {
		const cycleId = '_cycle_test';
		const cycleIdx = 0;
		const text = 'test';
		const cycle = makeCycle(cycleId, cycleIdx, makeCycleData(text));

		let result = false;
		const span = shallow(<CycleSpan 
			cycle={ cycle } callback={ () => { result = true; } } />);
		span.find('span').simulate('click');
		expect(result).toBe(true);
	});

});

