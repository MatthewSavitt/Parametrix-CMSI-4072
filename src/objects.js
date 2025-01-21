// objects.js
import * as THREE from './node_modules/three/build/three.module.js';

export function createCube() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshNormalMaterial()
    );
}
