import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Response from './Response';
import registerServiceWorker from './registerServiceWorker';
import data from './data.json';

const startIndex = 26;
ReactDOM.render(<App data={ data } pid={ startIndex } />, 
	document.getElementById('root'));
// ReactDOM.render(<Response data={ {
// 	"target": 15,
//     "text": "It had been years"
// } } callback={ (target) => { console.log(target); } } />, 
// 	document.getElementById('root'));
registerServiceWorker();
