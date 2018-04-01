import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import { shallow } from 'enzyme';
import App from './App';
import Passage from './Passage';
import data from './test_passage.json';

describe('App - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
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

	const makePassage = (passageData, advancePassage) => {
		return <Passage data={ passageData } advancePassage={ advancePassage } />;
	}

	it('renders as a div', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
	});

	it('does not contain a Passage without data', () => {
		renderer.render(<App />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual(false);
	});

	it('contains a Passage element', () => {
		const passage = {};
		const pid = 0;
		const data = { [pid]: passage };
		const app = shallow(<App data={ data } pid={ pid } />);
		expect(app.props().children).toEqual(
			makePassage(passage, app.instance().advancePassage));
	});

	it('correctly sets data passed into the Passage element', () => {
		const pid = 1;
		const testPassage = {
			pid: pid,
			text: 'test text'
		};
		const data = { [pid]: testPassage };
		const app = shallow(<App data={ data } pid={ pid } />);
		expect(app.props().children).toEqual(
			makePassage(testPassage, app.instance().advancePassage));
	});

	it('advances to the target Passage', () => {
		const firstPid = 0;
		const secondPid = 1;
		const thirdPid = 2;

		const makePassageData = (pid, text) => { return { pid: pid, text: text }; };
		const firstPassageData = makePassageData(firstPid, 'test1');
		const secondPassageData = makePassageData(secondPid, 'test2');
		const thirdPassageData = makePassageData(thirdPid, 'test3');

		const data = { 
			[firstPid]: firstPassageData, 
			[secondPid]: secondPassageData, 
			[thirdPid]: thirdPassageData 
		};
		const app = shallow(<App data={ data } pid={ firstPid } />);
		expect(app.props().children).toEqual(
			makePassage(firstPassageData, app.instance().advancePassage));

		app.instance().advancePassage(secondPid);
		expect(app.state().pid).toBe(secondPid);

		app.instance().advancePassage(firstPid);
		expect(app.state().pid).toBe(firstPid);

		app.instance().advancePassage(thirdPid);
		expect(app.state().pid).toBe(thirdPid);
	});

});

describe('App - Snapshot', () => {});
