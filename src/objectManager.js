import * as THREE from './node_modules/three/build/three.module.js';

// Array to keep track of objects
const objects = [];

/**
 * Add an object to the scene.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Object3D} object - The object to add.
 */
export function addObject(scene, object) {
    scene.add(object);
    objects.push(object);
}

/**
 * Create a cube with position, rotation, and scale.
 * @param {object} options - Options for the cube.
 * @returns {THREE.Mesh} The created cube.
 */
export function createCube(options = {}) {
    const {
        width = 1,
        height = 1,
        depth = 1,
        color = 0x00ff00, // this colors the cube, can be made an option 
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        scale = { x: 1, y: 1, z: 1 },
    } = options;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);

    // Apply position, rotation, and scale
    cube.position.set(position.x, position.y, position.z);
    cube.rotation.set(rotation.x, rotation.y, rotation.z);
    cube.scale.set(scale.x, scale.y, scale.z);

    return cube;
}

/**
 * Create a sphere with position, rotation, and scale.
 * @param {object} options - Options for the sphere.
 * @returns {THREE.Mesh} The created sphere.
 */
export function createSphere(options = {}) {
    const {
        color = 0x00ff00, // this colors the cube, can be made an option 
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 },
        scale = { x: 0.5, y: 0.5, z: 0.5 },
    } = options;

    const geometry = new THREE.SphereGeometry();
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);

    // Apply position, rotation, and scale
    sphere.position.set(position.x, position.y, position.z);
    sphere.rotation.set(rotation.x, rotation.y, rotation.z);
    sphere.scale.set(scale.x, scale.y, scale.z);

    return sphere;
}


/**
 * Get all objects currently managed.
 * @returns {THREE.Object3D[]} Array of all managed objects.
 */
export function getObjects() {
    return objects;
}
