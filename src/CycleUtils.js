/**
 * Helper functions to preprocess and create cycle link data objects.
 * Dependency on InventoryUtils.
 */
 
import { allExcept, mergeActions, removeActions } from './InventoryUtils';

const makeCycle = (cycleId, cycleIdx, ...dataEntries) => {
	return {
		cycle_id: cycleId,
		cycle_idx: cycleIdx,
		data: [ ...dataEntries ]
	};
}

const makeCycleData = (text, actions = null, conditions = null) => {
	return {
		actions: actions,
		conditions: conditions,
		text: text
	};
}

const updatedInventoryForCycle = (cycleId, cycleIdx, cycleData, inventory) => {
	const oldCycles = inventory.cycles || {};
	const currentCycleIdx = oldCycles.hasOwnProperty(cycleId)
		? oldCycles[cycleId]
		: 0;

	const allExceptCycleId = allExcept(oldCycles, cycleId);
	const newCycles = oldCycles.hasOwnProperty(cycleId)
		? { ...allExceptCycleId, [cycleId]: cycleIdx }
		: { ...oldCycles, [cycleId]: cycleIdx };

	const newActions = mergeActions(
		removeActions(inventory.actions, cycleData[currentCycleIdx].actions),
		cycleData[cycleIdx].actions);

	const { actions, cycles, ...otherInventory } = inventory;
	return { ...otherInventory, cycles: newCycles, actions: newActions };
}

export { makeCycle, makeCycleData, updatedInventoryForCycle };
