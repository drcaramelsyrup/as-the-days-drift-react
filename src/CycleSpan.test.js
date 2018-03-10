import React from 'react';
import ReactDOM from 'react-dom';
import CycleSpan from './CycleSpan';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<CycleSpan />, div);
	ReactDOM.unmountComponentAtNode(div);
});
