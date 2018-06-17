import React from 'react';
import TestRenderer from 'react-test-renderer';
import ReactDOM from 'react-dom';

import { Surface } from 'gl-react-headless';
import loseGL from 'gl-react-headless/lib/loseGL';
import { Shaders, Node, GLSL } from 'gl-react';
import Background from './Background';

describe('Background - Smoke', () => {

	it('renders without crashing', () => {

		const div = document.createElement('div');

		ReactDOM.render(
			<Surface 
				width={1} height={1} 
				webglContextAttributes={
					{ preserveDrawingBuffer: 'true', debug: 'false' }
				}>
				<Background blue={0.5} />
			</Surface>, div);
		ReactDOM.unmountComponentAtNode(div);
	});

});

