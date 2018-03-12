import React from 'react';

const CycleSpan = (props) => {
	return (<span className='cycle'>{ 
		processText(props.text)
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

export default CycleSpan;