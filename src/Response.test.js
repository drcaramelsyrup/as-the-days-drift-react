import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';

import Response from './Response';

describe('Response - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Response />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('Response - Render', () => {

	const makeResponse = (idx, data) => {
		return <div></div>;
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

	it('does not render without data', () => {
		renderer.render(<Response />);
		const output = renderer.getRenderOutput();
		expect(output).toBe(false);
	});

	it('renders as a div container', () => {
		renderer.render(<Response data={[]} />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
		expect(output.props.className).toBe('response');
	});

	it('renders with the appropriate text', () => {
		const text = 'test text ';
		renderer.render(<Response data={ makeResponseData(1, text) } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(text);
	});

	it('renders with the appropriate callback, with the response target', () => {
		const text = 'testing callback';
		const conditions = { tired: { type: '>=', val: '1' } };
		const target = 5;
		const data = makeResponseData(target, text, conditions);

		let callbackTarget = -1;
		const response = shallow(<Response 
			data={ data } callback={ (inTarget) => { callbackTarget = inTarget; } }/>);
		response.find('div').simulate('click');
		expect(callbackTarget).toBe(target);

	});

	// it('renders a list of response data', () => {
	// 	const firstResponse = { target: 1, text: 'And then' };
	// 	const secondResponse = { target: 2, text: 'Over here' };
	// 	const responses = [ firstResponse, secondResponse ];

	// 	renderer.render(<Response data={ responses } />);
	// 	const output = renderer.getRenderOutput();
	// 	expect(output.props.children).toEqual([
	// 		makeResponse(0, firstResponse),
	// 		makeResponse(1, secondResponse)
	// 	]);
	// });

});
