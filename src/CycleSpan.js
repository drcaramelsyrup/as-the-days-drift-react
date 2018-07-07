import React from 'react';
import './CycleSpan.css';

const CycleSpan = (props) => {
	const callback = props.callback != null ? props.callback : null;
	return isValidCycle(props.cycle) 
		&& (<span className='cycle' 
			onClick={ callback } 
			isInteractive={ isInteractive(props.cycle) }>{
				getCycleText(props.cycle)
			}</span>);
}

const isValidCycle = (cycle) => {
	return cycle != null 
		&& cycle.data != null 
		&& cycle.data.length > 0;
}

const isInteractive = (cycle) => {
	return isValidCycle(cycle) && cycle.data.length > 1
		? 1
		: 0;
}

const isValidCycleIdx = (cycleIdx) => {
	return cycleIdx != null && cycleIdx >= 0;
}

const getCycleText = (cycle) => {
	const cycleIdx = isValidCycleIdx(cycle.cycle_idx)
		? cycle.cycle_idx
		: 0;
	return cycle.data[cycleIdx].text;
}

export default CycleSpan;