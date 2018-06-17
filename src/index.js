import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import data from './data.json';

const START_INDEX = 26;
ReactDOM.render(<App data={ data } pid={ START_INDEX } />, 
	document.getElementById('root'));
registerServiceWorker();
