// objects.js
import * as THREE from './node_modules/three/build/three.module.js';

export function createCube() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshNormalMaterial()
    );
}

export function createSphere() {
    return new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshNormalMaterial()
    );
}
