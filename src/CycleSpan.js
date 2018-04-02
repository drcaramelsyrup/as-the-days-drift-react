import React from 'react';

const CycleSpan = (props) => {
	const callback = props.callback != null ? props.callback : null;
	return isValidCycle(props.cycle) 
		&& (<span className='cycle' onClick={ callback }>{ 
				getCycleText(props.cycle)
			}</span>);
}

const isValidCycle = (cycle) => {
	return cycle != null 
		&& cycle.data != null 
		&& cycle.data.length > 0;
}

const getCycleText = (cycle) => {
	const cycleIdx = cycle.cycle_idx != null
		? cycle.cycle_idx
		: 0;
	return cycle.data[cycleIdx].text;
}

export default CycleSpan;