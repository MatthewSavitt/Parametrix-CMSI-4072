import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

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

//todo: add a function to remove all objects from the scene
export function removeAllObjects(scene) {
    for (let i = objects.length - 1; i >= 0; i--) {
        removeObject(scene, objects[i]);
    }
}

//todo: add a function to update all objects in the scene according to a given function, if they have one 
export function updateAllObjects(scene, updateFunction) {
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].update) {
            objects[i].update();
        }
    }
}

//todo: add a method to update a single object in the scene according to a given function, if it has one
export function updateObject(scene, object, updateFunction) {
    if (object.update) {
        object.update();
    }
}
//where does object.update() come from? it is a method that is added to the object when it is created, if it has one
//it is a method that is added to the object when it is created, if it has one
//now I need a function to assign the function given by the user for a single dimension of either: position, rotation, scale, or color:
export function assignFunctionToObject(object, functionName, functionValue) {
    object[functionName] = functionValue;
}