import * as THREE from './node_modules/three/build/three.module.js';
import { x, y, z } from './parametricFunctions.js';

export function generateSamples(t1, t2, N, startPoint) {
    const samples = [];
    const incr = (t2 - t1) / (N - 1);
    for (let i = 0; i < N; i++) {
        let t = t1 + i * incr;
        samples.push([
            x(t) + startPoint.x, 
            y(t) + startPoint.y, 
            z(t) + startPoint.z
        ]);
    }
    return samples;
}

export function drawCurve(scene, samples, parentObject) {
    const points = samples.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Calculate line color based on endpoint averages
    const colorArray = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const avg = start.clone().add(end).divideScalar(2);
        const color = new THREE.Color(
            Math.abs(avg.x / 2),
            Math.abs(avg.y / 2),
            Math.abs(avg.z / 2)
        );
        for (let j = 0; j < 3; j++) {
            colorArray.set(color.toArray(), i * 3);
        }
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: true });
    const line = new THREE.Line(geometry, material);

    // Associate curve with parent object
    line.parentObject = parentObject;

    // Check if the parent object is in the scene
    const isParentInScene = scene.children.includes(parentObject);
    if (!isParentInScene) {
        line.removeFromParent(); // Remove the curve if the parent isn't found
    }

    // Ignore raycasting for the line
    line.raycast = () => {};

    return line; // Return the curve
}
