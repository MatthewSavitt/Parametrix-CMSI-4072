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
 * Get all objects currently managed.
 * @returns {THREE.Object3D[]} Array of all managed objects.
 */
export function getObjects() {
    return objects;
}
/**
 * Remove an object from the scene.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {THREE.Object3D} object - The object to remove.
 */
export function removeObject(scene, object) {
    scene.remove(object);
    const index = objects.indexOf(object);
    if (index !== -1) {
        objects.splice(index, 1);
    }
    object.geometry.dispose();
    object.material.dispose();
    object = null;
}