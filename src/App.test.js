import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';

import App from './App';
import Passage from './Passage';
import Background from './Background';
import { Surface } from 'gl-react-dom';
import test_data from './test_appdata.json';

// We have to pass in 'noBackground'
// for anything not shallowly rendered.
// (gl-react has React 16 warnings.)

describe('App - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App noBackground={ 1 } />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('App - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	const makePassage = (passageData, updatePassage, advancePassage) => {
		return (<Passage 
			data={ passageData } 
			update={ updatePassage }
			advance={ advancePassage } 
			inventory={ {} } />);
	}

	const makeBackground = (width, height, inventory = {}) => {
		return (
			<div className='BackgroundSurface'>
				<Surface width={ width } height={ height } >
					<Background width={ width } height={ height } 
						inventory={ inventory } />
				</Surface>
			</div>
		);
	}

	it('renders as a div', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('does not contain a Passage without data', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(
			output.props.children.filter(
				child => child.type !== 'Passage'));
	});

	it('contains a Passage element', () => {
		const passage = {};
		const pid = 0;
		const data = { [pid]: passage };
		const app = shallow(<App data={ data } pid={ pid } />);
		expect(app.props().children).toContainEqual(
			makePassage(
				passage, 
				app.instance().updatePassage,
				app.instance().advancePassage));
	});

	it('correctly sets data passed into the Passage element', () => {
		const pid = 1;
		const testPassage = {
			pid: pid,
			text: 'test text'
		};
		const data = { [pid]: testPassage };
		const app = shallow(<App data={ data } pid={ pid } />);
		expect(app.props().children).toContainEqual(
			makePassage(
				testPassage, 
				app.instance().updatePassage,
				app.instance().advancePassage));
	});

	it('contains a Background element', () => {
		const app = shallow(<App />);
		expect(app.props().children).toContainEqual(
			makeBackground(
				global.window.innerWidth, 
				global.window.innerHeight));
	});

	it('correctly resizes when the window dimensions change', () => {
		global.window.innerWidth = 500;
		global.window.innerHeight = 500;

		const app = mount(<App noBackground={ 1 } />);
		expect(app.state().width).toBe(global.window.innerWidth);
		expect(app.state().height).toBe(global.window.innerHeight);

		const resizedWidth = 2000;
		const resizedHeight = 100;
		global.window.innerWidth = resizedWidth;
		global.window.innerHeight = resizedHeight;
		global.dispatchEvent(new Event('resize'));

		expect(app.state().width).toBe(global.window.innerWidth);
		expect(app.state().height).toBe(global.window.innerHeight);

		app.unmount();
		// TODO: check that unmount gets called?
	});

});

describe('App - Snapshot', () => {

	it('renders a complete sequence of passages', () => {
		const startIdx = 26;
		const tree = TestRenderer.create(
			<App noBackground={ 1 } data={ test_data } pid={ startIdx } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});
