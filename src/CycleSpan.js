import React from 'react';

const CycleSpan = (props) => {
	const callback = props.callback != null ? props.callback : null;
	return isValidCycle(props.cycle) 
		&& (<span className='cycle' onClick={ callback }>{ 
				getCycleText(props.cycle)
			}</span>);
}

const splitOnUnescapedWhitespace = (rawText) => {
	if (rawText == null)
		return [];
	// Match character sequences, except for special whitespace characters,
	// and match those separately.
	const re = /(\\t|\\n|\\r)|[^\\]+/g;
	return rawText.match(re);
}

const processText = (rawText) => {

	const splitText = splitOnUnescapedWhitespace(rawText);
	let sectionKey = 0;
	return splitText.map((text) => {
		// TODO: Is there a better way to render tabs?
		if (text.includes('\\t')) {
			return <span key={ 'tab' + sectionKey }>&#9;&#9;&#9;&#9;</span>;
		} else if (text.includes('\\r') || text.includes('\\n')) {
			return <br key={ ++sectionKey } />;
		}
		return <span key={ 'text' + sectionKey }>{ text }</span>;
	});

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