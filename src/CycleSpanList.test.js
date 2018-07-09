import React from 'react';
import ReactDOM from 'react-dom';
import ShallowRenderer from 'react-test-renderer/shallow';
import TestRenderer from 'react-test-renderer';
import CycleSpanList, { cycleSpanUpdateFunction } from './CycleSpanList';
import CycleSpan from './CycleSpan';
import { makeCycle, makeCycleData } from './CycleUtils';
import data from './test_cyclespanlist.json';

describe('CycleSpanList - Smoke', () => {

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<CycleSpanList />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

describe('CycleSpanList - Render', () => {

	let renderer;

	beforeEach(() => {
		renderer = new ShallowRenderer();
	});

	afterEach(() => {
		renderer.unmount();
	});

	const makeTextCycle = (text) => {
		return makeCycle(null, null,
			makeCycleData(text, null, null));
	}

	const makeCycleSpan = (cycle, inventory, callback, keyNum) => {

		const makeExpectedCallback = cycleSpanUpdateFunction(
			cycle, inventory, callback
		);

		return (<CycleSpan 
			key={ 'cyclespan' + keyNum } 
			cycle={ cycle }
			callback={ callback } />);
	}

	const getCallbacks = (cycleSpans) => {
		// Because anonymous functions can't be tested for functional equality...
		// We'll grab them from the elements themselves for object identity comparison
		return cycleSpans.map((span) => {
			return span.props.callback;
		});
	}

	it('renders as a div container', () => {
		renderer.render(<CycleSpanList />);
		const output = renderer.getRenderOutput();
		expect(output.type).toBe('div');
		expect(output.props.className).toBe('CycleSpanList');
	});

	it('renders with empty text', () => {
		const dummyPassageData = { text: '' };
		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();
		expect(output.props.children).toEqual([]);
	})

	it('renders with simple text', () => {
		let text = 'test text';
		const dummyPassageData = { text: text };

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();

		const spanIdx = 0;
		const noInventory = undefined;
		const callbacks = getCallbacks(output.props.children);
		expect(output.props.children).toEqual(
			[ makeCycleSpan(
				makeTextCycle(text), 
				noInventory, callbacks[spanIdx], spanIdx) ]
		);
	});

	it('renders a simple cycling link', () => {
		const textBeforeLink = 'test before ';
		const testLinkText = 'this is a cycling link';
		const textAfterLink = ' test after';
		const cycleId = '_cycle_test';

		const dummyPassageData = {
			cycles: {
				[cycleId]: [
					{
						actions: null,
						conditions: null,
						text: testLinkText
					}
				]
			},
			text: textBeforeLink + cycleId + textAfterLink
		};

		renderer.render(<CycleSpanList data={ dummyPassageData } />);
		const output = renderer.getRenderOutput();

		let spanIdx = 0;
		const cycleIdx = 0;
		const noInventory = undefined;
		const callbacks = getCallbacks(output.props.children);
		expect(output.props.children).toEqual([
			makeCycleSpan(
				makeTextCycle(textBeforeLink),
				noInventory, callbacks[spanIdx], spanIdx++),
			makeCycleSpan(
				makeCycle(cycleId, cycleIdx, 
					makeCycleData(testLinkText)),
				noInventory, callbacks[spanIdx], spanIdx++),
			makeCycleSpan(
				makeTextCycle(textAfterLink),
				noInventory, callbacks[spanIdx], spanIdx++),
		]);
	});

	it('renders a cycling link and can swap between cycles', () => {
		const firstLinkText = 'this is a cycling link';
		const secondLinkText = 'this is the second cycling link';
		const cycleId = '_cycle_test';
		const cycleIdx = 1;

		const dummyPassageData = {
			cycles: {
				[cycleId]: [{
					actions: null,
					conditions: null,
					text: firstLinkText
				}, {
					actions: null,
					conditions: null,
					text: secondLinkText
				}]
			},
			text: cycleId
		};

		const inventory = {
			cycles: {
				[cycleId]: cycleIdx
			}
		};
		renderer.render(<CycleSpanList 
			data={ dummyPassageData } inventory={ inventory } />);
		const output = renderer.getRenderOutput();

		const spanIdx = 0;
		
		const callbacks = getCallbacks(output.props.children);
		expect(output.props.children).toEqual([
			makeCycleSpan(
				makeCycle(cycleId, cycleIdx,
					makeCycleData(firstLinkText),
					makeCycleData(secondLinkText)),
				inventory, callbacks[spanIdx], spanIdx)
		]);
	});

	it('renders multiple cycling links in the same passage', () => {
		const firstCycleId = '_cycle_test_1';
		const firstText1 = 'test for cycle 1';
		const firstText2 = ' other test for cycle 1';

		const textBetween = ' ';

		const secondCycleId = '_cycle_test_2';
		const secondText1 = 'test for cycle2';

		const thirdCycleId = '_cycle_test_3';
		const thirdText1 = 'third';
		const thirdText2 = 'third cycle \n test ';

		const firstCycleIdx = 0;
		const secondCycleIdx = 0;
		const thirdCycleIdx = 1;

		const dummyPassageData = {
			cycles: {
				[firstCycleId]: [{
					actions: null,
					conditions: null,
					text: firstText1
				}, {
					actions: null,
					conditions: null,
					text: firstText2 
				}],
				// data positions should not affect ultimate placement
				[thirdCycleId]: [{
					actions: null,
					conditions: null,
					text: thirdText1
				}, {
					actions: null,
					conditions: null,
					text: thirdText2
				}],
				[secondCycleId]: [{
					actions: null,
					conditions: null,
					text: secondText1
				}]
			},
			text: firstCycleId + textBetween + secondCycleId + thirdCycleId
		};

		const inventory = {
			cycles: {
				[firstCycleId]: firstCycleIdx,
				[secondCycleId]: secondCycleIdx,
				[thirdCycleId]: thirdCycleIdx 
			}
		};
		renderer.render(<CycleSpanList 
			data={ dummyPassageData } inventory={ inventory } />);

		const output = renderer.getRenderOutput();
		let spanIdx = 0;
		const cycles = dummyPassageData.cycles;
		const callbacks = getCallbacks(output.props.children);
		expect(output.props.children).toEqual([
			makeCycleSpan(
				makeCycle(firstCycleId, firstCycleIdx, 
					makeCycleData(firstText1),
					makeCycleData(firstText2)),
				inventory, callbacks[spanIdx], spanIdx++),
			makeCycleSpan(
				makeTextCycle(textBetween), 
				inventory, callbacks[spanIdx], spanIdx++),
			makeCycleSpan(
				makeCycle(secondCycleId, secondCycleIdx, 
					makeCycleData(secondText1)),
				inventory, callbacks[spanIdx], spanIdx++),
			makeCycleSpan(
				makeCycle(thirdCycleId, thirdCycleIdx, 
					makeCycleData(thirdText1),
					makeCycleData(thirdText2)),
				inventory, callbacks[spanIdx], spanIdx++)
		]);
	});

	describe('Conditions', () => {
		const cycleId = '_cycle_condition_test';
		const actions = {
			romantic: '1',
			complacent: '2'
		};
		const conditions = {
			neuroticism: {
				type: '<',
				val: '5'
			}
		};
		const conditionText = 'test condition';
		const testText = 'test render';
		const dummyPassageData = {
			pid: 0,
			cycles: {
				[cycleId]: [
					{
						actions: actions,
						conditions: conditions,
						text: conditionText
					},
					{
						actions: actions,
						conditions: null,
						text: testText
					}
				]
			},
			text: cycleId
		};

		const conditionalCycleIdx = 0;
		const nonconditionalCycleIdx = 1;
		const spanIdx = 0;

		const spanWithExpectedIdx = (cycleIdx, inventory, callback) => {
			return makeCycleSpan(
				makeCycle(cycleId, cycleIdx,
					makeCycleData(conditionText, actions, conditions),
					makeCycleData(testText, actions, null)),
				inventory, callback, spanIdx);
		}

		it('does not render a span with conditions without an inventory', () => {
			renderer.render(<CycleSpanList data={ dummyPassageData } />);
			const output = renderer.getRenderOutput();
			const noInventory = undefined;
			const callbacks = getCallbacks(output.props.children);
			expect(output.props.children).toEqual(
				[ spanWithExpectedIdx(nonconditionalCycleIdx, noInventory, callbacks[0]) ]);
		});

		it('does not render a span with conditions when unsatisfied', () => {
			const inventory = { neuroticism: 5 };
			renderer.render(<CycleSpanList 
				data={ dummyPassageData } 
				inventory={ inventory } />);
			const outputNotSatisfied = renderer.getRenderOutput();
			const callbacks = getCallbacks(outputNotSatisfied.props.children);
			expect(outputNotSatisfied.props.children).toEqual(
				[ spanWithExpectedIdx(nonconditionalCycleIdx, inventory, callbacks[0]) ]);
		});

		it('renders a span with conditions when satisfied', () => {
			const inventory = { neuroticism: 3 };
			renderer.render(<CycleSpanList 
				data={ dummyPassageData } 
				inventory={ inventory } />);
			const outputSatisfied = renderer.getRenderOutput();
			const callbacks = getCallbacks(outputSatisfied.props.children);
			expect(outputSatisfied.props.children).toEqual(
				[ spanWithExpectedIdx(conditionalCycleIdx, inventory, callbacks[0]) ]);
		});
	});

	describe('Conditional Blocks', () => {
		const cycleId = '_cycle_condition_test';
		const cycleIdInConditional = '_cycle_inside_conditional';
		const firstConditionalCycleData = {
			actions: null,
			conditions: {
				temperamental: {
					type: '>',
					val: '5'
				}
			},
			text: 'this text might render'
		};
		const secondConditionalCycleData = {
			actions: null,
			conditions: null,
			text: 'this text shouldn\'t render'
		};

		const firstConditionalId = '_cond_text_0';
		const secondConditionalId = '_cond_text_1';
		const firstConditionalText = '\nCome on, Sam\'s already inside. ';
		const secondConditionalText = 'He continued to fidget.';

		const dummyPassageData = {
			pid: 0,
			conditionals: [
		        {
		            conditions: {
		                partner: {
		                    type: 'is',
		                    val: 'sam'
		                },
		                var_nervous_habit: {
		                	type: 'equals',
		                	val: 'fidgeting'
		                }
		            },
		            id: '_cond_text_0',
		            text: firstConditionalText
		        },
		        {
		            conditions: {
		                romantic: {
		                    type: '<=',
		                    val: '2'
		                },
		                complacent: {
		                	type: '>=',
		                	val: '8'
		                }
		            },
		            id: '_cond_text_1',
		            text: secondConditionalText + cycleIdInConditional
		        }
		    ],
			cycles: {
				[cycleId]: [
					{
						actions: null,
						conditions: null,
						text: 'this text will never render'
					}
				],
				[cycleIdInConditional]: [
					firstConditionalCycleData,
					secondConditionalCycleData 
				]
			},
			text: firstConditionalId + secondConditionalId
		};

		it('does not replace a conditional text block without a conditional id', () => {
			const inventory = { var_possession: 'orange' };
			const invalidPassageData = Object.assign({}, dummyPassageData);
			const conditionalId = 'orange';
			invalidPassageData.conditionals.push({
				conditions: {
					var_possession: {
						type: 'is',
						val: 'orange'
					}
				},
				text: 'text that will not be replaced'
			});
			invalidPassageData.text += conditionalId;
			renderer.render(<CycleSpanList
				data={ invalidPassageData }
				inventory={ inventory }
				callback={ null } />);
			const spanIdx = 0;
			const output = renderer.getRenderOutput();
			const callbacks = getCallbacks(output.props.children);
			expect(output.props.children).toEqual([ 
				makeCycleSpan(
					makeTextCycle(conditionalId),
					inventory, callbacks[spanIdx], spanIdx) ])
		});

		it('does not render a conditional text block when unsatisfied', () => {
			const inventory = {	romantic: 5 };
			renderer.render(<CycleSpanList 
				data={ dummyPassageData } 
				inventory={ inventory } 
				callback={ null } />);
			const output = renderer.getRenderOutput();
			expect(output.props.children).toEqual([]);
		});

		it('renders a conditional text block when satisfied', () => {
			const inventory = { 
				romantic: 6, complacent: 9, 
				partner: 'sam', var_nervous_habit: 'fidgeting' 
			};
			const noCallback = null;
			renderer.render(<CycleSpanList 
				data={ dummyPassageData } 
				inventory={ inventory }
				callback={ noCallback } />);
			const output = renderer.getRenderOutput();
			const spanIdx = 0;
			const callbacks = getCallbacks(output.props.children);
			expect(output.props.children).toEqual([
				makeCycleSpan(
					makeTextCycle(firstConditionalText),
					inventory, callbacks[spanIdx], spanIdx)
			])
		});

		it('renders a cycle span inside a conditional text block', () => {
			const inventory = {
				romantic: 2, complacent: 8, temperamental: 6
			};
			renderer.render(<CycleSpanList 
				data={ dummyPassageData } 
				inventory={ inventory } />);
			const output = renderer.getRenderOutput();
			let spanIdx = 0;
			const expectedCycleIdx = 0;
			const callbacks = getCallbacks(output.props.children);
			expect(output.props.children).toEqual([
				makeCycleSpan(
					makeTextCycle(secondConditionalText),
					inventory, callbacks[spanIdx], spanIdx++),
				makeCycleSpan(
					makeCycle(cycleIdInConditional, expectedCycleIdx,
						firstConditionalCycleData,
						secondConditionalCycleData),
					inventory, callbacks[spanIdx], spanIdx++)
			]);
		});
	});

	describe('CycleSpanList - cycleSpanUpdateFunction', () => {

		it('does not call the callback on a pure text cycle', () => {
			const inventory = { 
				romantic: 3,
				cycles: {}
			};
			const cycle = makeCycle(null, 0, makeCycleData('test text'));

			let callbackCalled = false;
			const callback = (nextInventory) => { callbackCalled = true; }
			cycleSpanUpdateFunction(cycle, inventory, callback)();
			expect(callbackCalled).toBe(false);
		});

		it('will update the cycle index appropriately', () => {
			const firstCycleId = 'cycleid';
			const firstCycleIdx = 0;
			const secondCycleId = 'cycleid2';
			const secondCycleIdx = 0;

			const inventory = { 
				romantic: 3,
				cycles: {
					[firstCycleId]: firstCycleIdx,
					[secondCycleId]: secondCycleIdx
				}
			};
			const newInventory = {
				romantic: 1, complacent: 1,
				cycles: {
					[firstCycleId]: firstCycleIdx + 1,
					[secondCycleId]: secondCycleIdx
				}
			};

			const firstText = 'test text 1';
			const secondText = 'test text 2';
			const cycle = makeCycle(firstCycleId, firstCycleIdx,
				makeCycleData(firstText),
				makeCycleData(secondText));
			const newCycle = makeCycle(firstCycleId, firstCycleIdx + 1,
				makeCycleData(firstText),
				makeCycleData(secondText));

			// Both the cycle update and the inventory update are necessary right now.
			// Even though they have redundant information.
			// The ultimate setup will have to depend on the ultimate data binding.

			let callbackCycles = {};
			const callback = (nextInventory) => {
				callbackCycles = nextInventory.cycles;
			};

			cycleSpanUpdateFunction(cycle, inventory, callback)();
			expect(callbackCycles).toEqual({
				[firstCycleId]: firstCycleIdx + 1,
				[secondCycleId]: secondCycleIdx
			});
			cycleSpanUpdateFunction(newCycle, newInventory, callback)();
			expect(callbackCycles).toEqual({
				[firstCycleId]: firstCycleIdx,
				[secondCycleId]: secondCycleIdx
			});
		});

		it('will accumulate actions in the new inventory', () => {

			const cycleId = 'cycleId';
			const cycleIdx = 0;
			let nextInventory = { romantic: 1, cycles: { [cycleId]: cycleIdx } };
			const firstActions = {
				romantic: 1,
				var_possession: 'crystal'
			};
			const secondActions = {
				romantic: 2,
				practical: 1
			};
			const firstAfterSecondActions = {
				romantic: 1,
				practical: 0,
				var_possession: 'crystal'
			};
			const secondAfterFirstActions = {
				romantic: 2,
				practical: 1
			};

			const firstText = 'test text 1';
			const secondText = 'test text 2';
			const cycle = makeCycle(cycleId, cycleIdx,
				makeCycleData(firstText, firstActions),
				makeCycleData(secondText, secondActions));
			const newCycle = makeCycle(cycleId, cycleIdx + 1,
				makeCycleData(firstText, firstActions),
				makeCycleData(secondText, secondActions));

			const testingCallback = (inInventory) => {
				nextInventory = Object.assign({}, inInventory);
			}
			cycleSpanUpdateFunction(cycle, nextInventory, testingCallback)();
			expect(nextInventory.actions).toEqual(secondActions);

			cycleSpanUpdateFunction(newCycle, nextInventory, testingCallback)();
			expect(nextInventory.actions).toEqual(firstAfterSecondActions);

			cycleSpanUpdateFunction(cycle, nextInventory, testingCallback)();
			expect(nextInventory.actions).toEqual(secondAfterFirstActions);

		});

	});

});

describe('CycleSpanList - Snapshot', () => {

	it('renders with a complete data passage', () => {
		const tree = TestRenderer.create(<CycleSpanList data={ data } />).toJSON();
		expect(tree).toMatchSnapshot();
	});

});

