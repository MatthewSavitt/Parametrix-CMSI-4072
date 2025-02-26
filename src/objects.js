import * as THREE from './node_modules/three/build/three.module.js';

/**
 * General function to create a 3D object.
 * @param {Function} geometryFunc - Function that returns a THREE.Geometry.
 * @param {object} options - Options for the object.
 * @returns {THREE.Mesh} The created object.
 */
export function createObject(geometryFunc, options = {}) {
    const {
        color = 0x00ff00, // Default green
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 }
    } = options;

    // Generate geometry and material
    const geometry = geometryFunc();
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    // Apply transformations
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.scale.set(scale.x, scale.y, scale.z);

    return mesh;
}

/**
 * Creates a cube using the general `createObject` function.
 * @param {object} options - Customization options.
 * @returns {THREE.Mesh} The created cube.
 */
export function createCube(options) {
    return createObject(() => new THREE.BoxGeometry(
        options.width || 1, 
        options.height || 1, 
        options.depth || 1
    ), options);
}

/**
 * Creates a sphere using the general `createObject` function.
 * @param {object} options - Customization options.
 * @returns {THREE.Mesh} The created sphere.
 */
export function createSphere(options) {
    return createObject(() => new THREE.SphereGeometry(), options);
}
