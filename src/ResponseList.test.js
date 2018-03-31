import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import ResponseList from './ResponseList';

describe('ResponseList - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<ResponseList />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('ResponseList - Render', () => {

	const makeResponse = (idx, data) => {
		return <Response key={ 'response'+idx } data={ data } />;
	}
	const makeResponseData = (target, text, conditions) => {
		return {
			target: target,
			text: text,
			...(conditions != null && { conditions: conditions })
		}
	};

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	it('does not render if not given data', () => {
		renderer.render(<ResponseList />);
		const output = renderer.getRenderOutput();
		expect(output).toBe(false);
	});

	it('renders as a div container', () => {
		renderer.render(<ResponseList data={[]} />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('renders a list of response data', () => {
		const firstResponse = { target: 1, text: 'And then' };
		const secondResponse = { target: 2, text: 'Over here' };
		const responses = [ firstResponse, secondResponse ];

		renderer.render(<ResponseList data={ responses } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual([
			makeResponse(0, firstResponse),
			makeResponse(1, secondResponse)
		]);
	});

	describe('Conditions', () => {

		const unsatisfiedResponse = makeResponseData(3, 'not satisfied', {
			neurotic: {
				type: '<',
				val: 5
			}
		});
		const satisfiedResponse = makeResponseData(11, 'satisfied', {
			practical: {
				type: '>=',
				val: 2
			},
			var_possession: {
				type: 'is',
				val: 'charm'
			}
		});
		const inventory = { neurotic: 7, var_possession: 'charm', practical: 3 };

		it('does not render responses for which it does not satisfy conditions', () => {
			const responses = [ unsatisfiedResponse ];
			renderer.render(<ResponseList data={ responses } inventory={ inventory } />);
			const output = renderer.getRenderOutput();
			expect(output.props.children).toEqual([]);
		});

		it('renders responses for which it satisfies conditions', () => {
			const satisfiedResponseIdx = 1;
			const responses = [ unsatisfiedResponse, satisfiedResponse ];
			renderer.render(<ResponseList data={ responses } inventory={ inventory } />);
			const output = renderer.getRenderOutput();
			expect(output.props.children).toEqual(
				[ makeResponse(satisfiedResponseIdx, satisfiedResponse) ]);
		});

	});



});
