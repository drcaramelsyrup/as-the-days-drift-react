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
		&& cycle.cycle_idx != null
		&& cycle.data[cycle.cycle_idx] != null;
}

const getCycleText = (cycle) => {
	return cycle.data[cycle.cycle_idx].text;
}

export default CycleSpan;