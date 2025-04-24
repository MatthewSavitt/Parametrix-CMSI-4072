import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

// Create a 90's style XYZ gizmo
function createGizmo() {
    const gizmo = new THREE.Group();
    gizmo.isGizmo = true; // Flag to identify this object as a gizmo
    // Length of the axes
    gizmo.visible = true;
    const axisLength = 1; // Shorter axes to fit inside the box

    // Colors for the axes (bright neon colors)
    const colors = {
        x: 0xff4444, // Red
        y: 0x44ff44, // Green
        z: 0x4444ff, // Blue
    };

    // Create X, Y, Z axes
    const xAxis = createAxis(new THREE.Vector3(axisLength, 0, 0), colors.x);
    const yAxis = createAxis(new THREE.Vector3(0, axisLength, 0), colors.y);
    const zAxis = createAxis(new THREE.Vector3(0, 0, axisLength), colors.z);

    // Add axes to the gizmo group
    gizmo.add(xAxis);
    gizmo.add(yAxis);
    gizmo.add(zAxis);

    // Add labels for X, Y, Z
    const labelSize = 0.1;
    const xLabel = createTextLabel('X', colors.x, labelSize);
    const yLabel = createTextLabel('Y', colors.y, labelSize);
    const zLabel = createTextLabel('Z', colors.z, labelSize);

    xLabel.position.set(axisLength + 0.1, 0, 0);
    yLabel.position.set(0, axisLength + 0.1, 0);
    zLabel.position.set(0, 0, axisLength + 0.1);

    gizmo.add(xLabel);
    gizmo.add(yLabel);
    gizmo.add(zLabel);

    return gizmo;
}

// Helper function to create an axis
function createAxis(direction, color) {
    const material = new THREE.LineBasicMaterial({ color: color });
    const points = [new THREE.Vector3(0, 0, 0), direction];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
}

// Helper function to create a text label
function createTextLabel(text, color, size) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    // Retro-style font and color
    context.font = 'Bold 48px Arial';
    context.fillStyle = `#${color.toString(16)}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, size);

    return sprite;
}

// Create a box with the gizmo inside
function createBoxWithGizmo() {
    const group = new THREE.Group();

    // Create the box
    const boxSize = 2.5; // Size of the box
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true, // Make the box wireframe for a retro look
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    group.add(box);

    // Create the gizmo and center it inside the box
    const gizmo = createGizmo();
    group.add(gizmo);

    return group;
}

//function that tells the object selection logic that this object is a gizmo
function isGizmo(object) {
    return object.hasOwnProperty('isGizmo') && object.isGizmo;
}

function hideGizmo(gizmo) {
    gizmo.visible = !gizmo.visible; // Toggle visibility
}

// Export the box with gizmo creation function
export { createGizmo, createBoxWithGizmo, isGizmo, hideGizmo};