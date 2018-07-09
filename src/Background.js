import React from 'react';
import { Shaders, Node, GLSL } from 'gl-react';
import { pullTraits, pullTraitValue } from './TraitUtils';
import { mergeActions } from './InventoryUtils';
import './Background.css';

const shaders = Shaders.create({
	watercolor: {
		frag: GLSL`
	// Adapted from https://www.shadertoy.com/view/XdSSWd by caosdoar

	precision mediump float;

	varying vec2 uv;

	uniform float time;

	uniform vec2 resolution;

	// Table of pigments 
	// from Computer-Generated Watercolor. Cassidy et al.
	vec3 K_QuinacridoneRose = vec3(0.22, 1.47, 0.57);
	vec3 S_QuinacridoneRose = vec3(0.05, 0.003, 0.03);
	vec3 K_FrenchUltramarine = vec3(0.86, 0.86, 0.06);
	vec3 S_FrenchUltramarine = vec3(0.005, 0.005, 0.09);
	vec3 K_CeruleanBlue = vec3(1.52, 0.32, 0.25);
	vec3 S_CeruleanBlue = vec3(0.06, 0.26, 0.40);
	vec3 K_HookersGreen = vec3(1.62, 0.61, 1.64);
	vec3 S_HookersGreen = vec3(0.01, 0.012, 0.003);
	vec3 K_HansaYellow = vec3(0.06, 0.21, 1.78);
	vec3 S_HansaYellow = vec3(0.50, 0.88, 0.009);
	vec3 K_Paper = vec3(0.5, 0.76, 0.8);
	vec3 S_Paper = vec3(0.5, 0.5, 0.5); 

#define PI 3.1415926535898
#define TRAIT_NUM 8
	uniform float traits[TRAIT_NUM];	// trait intensity
	// These might not have to be uniforms
	//uniform vec3 colors[TRAIT_NUM];	// trait colors
	//uniform vec2 positions[TRAIT_NUM];	// trait UV positions
	vec3 colors[TRAIT_NUM*2];


	vec2 rand(vec2 st)
	{
	    st = vec2(
	    	dot(st,vec2(127.1,311.7)),
	    	dot(st,vec2(269.5,183.3)));
	    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
	}

	float noise2d(vec2 p)
	{
		vec2 i = floor(p);	// integer component
		vec2 f = fract(p);	// fractional component

		// interpolation function
		vec2 u = smoothstep(0., 1., f);
		// blending between gradients, interpolating (fractional) directions
		return mix(
			mix(
				dot(rand(i + vec2(0., 0.)), f),
				dot(rand(i + vec2(1., 0.)), f - vec2(1., 0.)),
				u.x),
			mix(
				dot(rand(i + vec2(0., 1.)), f - vec2(0., 1.)),
				dot(rand(i + vec2(1., 1.)), f - vec2(1., 1.)),
				u.x),
			u.y);
	}

	vec3 sinh(vec3 z) { return vec3(0.5) * (exp(z) - exp(-z)); }
	vec3 cosh(vec3 z) { return vec3(0.5) * (exp(z) + exp(-z)); }

	// k, s: absorption and scattering coefficients
	// x: thickness of the pigmented layer
	// output: reflectance and transmittance through said layer
	void KubelkaMunk(vec3 k, vec3 s, float x, out vec3 refl, out vec3 trans)
	{
		vec3 a = (k/s) + vec3(1.0);
		vec3 b = sqrt(a*a - vec3(1.0));
		vec3 bsx = b * s * vec3(x);
		vec3 sinh_coeff = sinh(bsx);
		vec3 cosh_coeff = cosh(bsx);
		vec3 c = a * sinh_coeff + b * cosh_coeff;
		refl = sinh_coeff / c;
		trans = b / c;
	}

	// r1, t1: reflectance and transmittance of input layer 1
	// r2, t2: reflectance and transmittance of input layer 2
	// output: blended reflectance and transmittance
	void layering(vec3 r1, vec3 t1, vec3 r2, vec3 t2, out vec3 refl, out vec3 trans)
	{
		vec3 denom = vec3(1.0) - r1*r2;
		refl = r1 + ((t1*t1)*r2) / denom;
		trans = t1*t2 / denom;
	}

	// dist: > 0: inside brush fill; < 0: outside brush fill
	// h_avg: average hue of color inside filled area
	// h_var: variable intensity of color at edge of area
	// returns brush color intensity
	float brush_effect(float dist, float h_avg, float h_var)
	{
		// variable intensity effective within one distance unit
		float h = max(0.0, 1.0 - 10.0 * dist);
		// amplify edge darkening with a steep dropoff
		h *= h;
		h *= h;
		// if we are within this distance threshold, modulate between 0 and 1
		// this cuts off <0 areas
		float modulate_boundary = smoothstep(-0.01, 0.002, dist);
		return (h_avg + h_var * h) * modulate_boundary;
	}

	float fbm(vec2 grad)
	{
		return (0.1*noise2d(grad*2.14) + 0.01*noise2d(grad*3.011) + 0.05*noise2d(grad*6.0)) / 3.0;
	}

	void main()
	{
		colors[0] = K_CeruleanBlue;
		colors[1] = S_CeruleanBlue;
		colors[2] = K_FrenchUltramarine;
		colors[3] = S_FrenchUltramarine;
		colors[4] = K_HookersGreen;
		colors[5] = S_HookersGreen;
		colors[6] = K_HansaYellow;
		colors[7] = S_HansaYellow;
		colors[8] = K_QuinacridoneRose;
		colors[9] = S_QuinacridoneRose;
		colors[10] = K_QuinacridoneRose;
		colors[11] = S_QuinacridoneRose;
		colors[12] = K_QuinacridoneRose;
		colors[13] = S_QuinacridoneRose;
		colors[14] = K_QuinacridoneRose;
		colors[15] = S_QuinacridoneRose;

		vec2 scaled_uv = uv * vec2(1.0, resolution.y / resolution.x);

		// Make the texture of our paper
		float paper = 0.1;

		vec3 refl, trans;
		KubelkaMunk(K_Paper, S_Paper, paper, refl, trans);

		// droplet at the center
		float distScaling = 4.0;
		float startingAngle = -PI / 4.;
		float interval = PI / 4.;
		float length = 0.2;
		vec2 center = vec2(0.5, 0.3);

		for (int i = 0; i < TRAIT_NUM; ++i)
		{
			float iter = float(i);
			float angle = startingAngle + interval*iter;
			vec2 dropletCenter = center + vec2(
				cos(angle) * length,
				sin(angle) * length);
			vec2 toCenter = normalize(scaled_uv - dropletCenter);
			vec2 displaced_uv = (fbm(dropletCenter + toCenter)) + scaled_uv;

			float intensity = 0.1*traits[i];
			float droplet = brush_effect(intensity - distance(displaced_uv, dropletCenter) * distScaling, 0.1, 0.4);
			vec3 dropletR, dropletT;
			KubelkaMunk(colors[i*2], colors[i*2+1], droplet, dropletR, dropletT);
			layering(refl, trans, dropletR, dropletT, refl, trans);
		}

		gl_FragColor = vec4(refl+trans, 1.0);

	}
	`
	}
});

const mergeInventoryWithActions = (inInventory) => {
	const { actions, ...inventory } = inInventory;
	return mergeActions(inventory, actions);
}

const calculateTraitValues = (inInventory) => {
	const inventoryWithActions = mergeInventoryWithActions(inInventory);
	const traits = pullTraits(inventoryWithActions);
	return Object.keys(traits).reduce((acc, traitName) => {
		return acc.concat(pullTraitValue(traits, traitName));
	}, []);
}

const Background = (props) => {
	return (
		<div className='Background'>
			<Node
				shader={ shaders.watercolor }
				uniforms={{
					resolution: [
						props.width,
						props.height 
					],
					traits: (
						props.inventory != null 
							&& calculateTraitValues(props.inventory)
					)
				}}
			/>
		</div>
	);	
}

export default Background;