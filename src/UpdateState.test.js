import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import App from './App';
import Passage from './Passage';

describe('App - UpdateState - updatePassage', () => {

	const pid = 42;
	const text = 'update passage ';
	const dummyPassage = {
		id: pid,
		text: text
	};
	const dummyData = {
		[pid]: dummyPassage
	};

	it('renders and updates its inventory state', () => {
		const inventory = { conventional: 1, practical: 2 };
		const app = shallow(<App
			data={ dummyData }
			inventory={ inventory }
			pid={ pid } />);
		const newInventory = { unconventional: 1, romantic: 3 };
		app.instance().updatePassage(newInventory);
		expect(app.state().inventory).toEqual(newInventory);
	});

	it('renders and passes the update callback to children', () => {
		const inventory = { conventional: 1, practical: 2 };
		const app = shallow(<App
			data={ dummyData }
			inventory={ inventory }
			pid={ pid } />);

		expect(app.find('Passage').props().update)
			.toEqual(app.instance().updatePassage);
	});

});


describe('App - UpdateState - advancePassage', () => {

	const firstPid = 0;
	const secondPid = 1;
	const thirdPid = 2;
	const endPid = -1;

	const makePassageData = (pid, text, nextPid) => {
		return {
			pid: pid, 
			text: text, 
			target: nextPid
		}; 
	}

	const firstPassageData = makePassageData(firstPid, 'test1', secondPid);
	const secondPassageData = makePassageData(secondPid, 'test2', thirdPid);
	const thirdPassageData = makePassageData(thirdPid, 'test3', endPid);

	const data = { 
		[firstPid]: firstPassageData, 
		[secondPid]: secondPassageData, 
		[thirdPid]: thirdPassageData 
	};

	const makePassage = (passageData, updatePassage, advancePassage) => {
		return (<Passage 
			data={ passageData } 
			update={ updatePassage }
			advance={ advancePassage } 
			inventory={ {} } />);
	}

	it('advances to the target Passage pid', () => {
		const app = shallow(<App data={ data } pid={ firstPid } />);
		expect(app.props().children).toContainEqual(
			makePassage(
				firstPassageData, 
				app.instance().updatePassage,
				app.instance().advancePassage));

		app.instance().advancePassage(secondPid);
		expect(app.state().pid).toBe(secondPid);

		app.instance().advancePassage(firstPid);
		expect(app.state().pid).toBe(firstPid);

		app.instance().advancePassage(thirdPid);
		expect(app.state().pid).toBe(thirdPid);
	});

	it('renders and passes the advance callback to children', () => {
		const inventory = { conventional: 1, practical: 2 };
		const app = shallow(<App
			data={ data }
			inventory={ inventory }
			pid={ firstPid } />);

		expect(app.find('Passage').props().advance)
			.toEqual(app.instance().advancePassage);
	});

	/* We should include this test. However, enzyme can't seem to support it for React 16 yet... */
	// it('sets new passage data for the Passage element', () => {
	// 	const inventory = { practical: 3 };

	// 	const app = shallow(<App
	// 		data={ data }
	// 		inventory={ inventory }
	// 		pid={ firstPid } />);
	// 	expect(app.instance().props.data).toEqual(data);

	// 	app.instance().advancePassage(secondPid);
	// 	expect(app.find('Passage').props().data).toEqual(secondPassageData);
	// });

	it('integrates inventory actions', () => {
		const inventory = { 
			actions: {
				romantic: 1,
				neurotic: 1
			},
			romantic: 2
		};
		const integratedInventory = {
			romantic: 3,
			neurotic: 1
		};

		const app = shallow(<App
			data={ data }
			inventory={ inventory } />);

		app.instance().advancePassage(secondPid);
		expect(app.state().inventory).toEqual(integratedInventory);
	});

});

