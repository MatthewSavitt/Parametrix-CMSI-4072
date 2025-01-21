import * as THREE from './node_modules/three/build/three.module.js';
import { parametricFunctions } from './parametricFunctions.js';

/**
 * Generate samples for a parametric function.
 * @param {string} funcName - The name of the parametric function to use.
 * @param {object} params - The parameters for the selected function.
 * @param {number} t1 - Start of the parameter range.
 * @param {number} t2 - End of the parameter range.
 * @param {number} N - Number of samples to generate.
 * @returns {Array} An array of sample points { x, y, z }.
 */
export function generateSamples(funcName, params, t1, t2, N) {
    const samples = [];
    const parametricFunc = parametricFunctions[funcName];
    if (!parametricFunc) throw new Error(`Function ${funcName} not found in parametricFunctions`);

    const step = (t2 - t1) / (N - 1);
    for (let i = 0; i < N; i++) {
        const t = t1 + i * step;
        samples.push(parametricFunc.generate(t, params));
    }
    return samples;
}

/**
 * Draw a curve using an array of sample points.
 * @param {THREE.Scene} scene - The scene to add the curve to.
 * @param {Array} samples - An array of sample points { x, y, z }.
 * @returns {THREE.Line} The curve object added to the scene.
 */
export function drawCurve(scene, samples) {
    const curveGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(samples.length * 3);

    samples.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
    });

    curveGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curve = new THREE.Line(curveGeometry, curveMaterial);

    scene.add(curve);
    return curve;
}

/**
 * Regenerate the curve with updated parameters.
 * @param {THREE.Scene} scene - The scene to update.
 * @param {string} funcName - The name of the parametric function to use.
 * @param {object} params - Parameters for the parametric function.
 * @param {number} t1 - Start of the parameter range.
 * @param {number} t2 - End of the parameter range.
 * @param {number} N - Number of sample points.
 */
export function regenerateCurve(scene, funcName, params, t1, t2, N) {
    // Remove the current curve from the scene, if it exists
    if (currentCurve) {
        scene.remove(currentCurve);
        currentCurve.geometry.dispose();
        currentCurve.material.dispose();
        currentCurve = null;
    }

    // Generate new samples and draw the curve
    const samples = generateSamples(funcName, params, t1, t2, N);
    currentCurve = drawCurve(scene, samples);
}
