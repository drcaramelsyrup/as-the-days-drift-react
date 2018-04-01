import React from 'react';

const Response = (props) => {
	return props.data != null && (
		<div className='response' 
			onClick={ callbackOnTarget(props.callback, props.data.target) }>
			{ props.data.text }
		</div>
	);
}

const callbackOnTarget = (callback, target) => {
	return () => { callback(target); };
}


export default Response;
