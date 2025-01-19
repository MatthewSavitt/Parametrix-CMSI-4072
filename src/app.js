import * as THREE from './node_modules/three/build/three.module.js';
import { generateSamples, drawCurve } from './curve.js';
import { createUI } from './ui.js';

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a generic object (cube for now) and a group
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const obj = new THREE.Mesh(geometry, material);
const objectGroup = new THREE.Group();  // Group for the object and its path
scene.add(objectGroup);
objectGroup.add(obj);
camera.position.z = 5;

let selectedObject = obj; // Select the default object initially
let followingPath = true; // Flag to indicate if the object is following a path
let paused = false; // Flag to control the animation state

// Variables for sample manipulation
let t1 = 0;
let t2 = 2 * Math.PI;
let N = 100; // Default number of samples
let index = 0;
let samples = generateSamples(t1, t2, N, obj.position);
let speed = 1; // Speed of the animation

// Function to update the object's position
function updateObjectPosition(object) {
    const [x, y, z] = samples[index];
    object.position.set(x, y, z);
    renderer.render(scene, camera);
}

// Function to regenerate samples and update the curve
function regenerateCurve() {
    // Remove the old curve if it exists
    if (selectedObject.parent) {
        const oldCurve = selectedObject.parent.getObjectByProperty('type', 'Line');
        if (oldCurve) {
            selectedObject.parent.remove(oldCurve);
        }
    }

    // Generate new samples and draw new curve
    samples = generateSamples(t1, t2, N, selectedObject.position);
    const newPath = drawCurve(scene, samples, selectedObject);
    selectedObject.parent.add(newPath);  // Add the new curve to the same group
}


// Create UI components
const uiContainer = createUI();
uiContainer.style.display = 'flex';
uiContainer.style.flexDirection = 'column';
uiContainer.style.alignItems = 'flex-start';

const createLabeledInput = (labelText, inputType, initialValue, minValue, onChange) => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '5px 0'; // Add spacing for visibility

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.marginRight = '5px'; // Add space between label and input
    container.appendChild(label);

    const input = document.createElement('input');
    input.type = inputType;
    input.value = initialValue;
    if (minValue !== undefined) input.min = minValue;
    input.max = 5; // Maximum speed (adjust as needed)
    input.step = 0.1; // Increment step for smoother speed control
    input.addEventListener('input', onChange);
    container.appendChild(input);

    return container;
};

// Add UI elements
const slider = createLabeledInput('Current Sample:', 'range', index, 0, (e) => {
    index = parseInt(e.target.value, 10);
    updateObjectPosition(obj); // Use the generic object
});
slider.children[1].max = (N - 1).toString(); // Set maximum slider value
uiContainer.appendChild(slider);

uiContainer.appendChild(createLabeledInput('Playback Speed:', 'number', speed, 0.1, (e) => {
    speed = parseFloat(e.target.value);
}));

uiContainer.appendChild(createLabeledInput('Sample Count:', 'number', N, 2, (e) => {
    N = Math.max(parseInt(e.target.value, 10), 2);
    slider.children[1].max = (N - 1).toString(); // Update slider max
    regenerateCurve();
}));

uiContainer.appendChild(createLabeledInput('Start Point:', 'number', t1, undefined, (e) => {
    t1 = parseFloat(e.target.value);
    regenerateCurve();
}));

uiContainer.appendChild(createLabeledInput('End Point:', 'number', t2, undefined, (e) => {
    t2 = parseFloat(e.target.value);
    regenerateCurve();
}));

const advanceButton = document.createElement('button');
advanceButton.textContent = 'Advance Frame';
advanceButton.addEventListener('click', () => {
    index = (index + 1) % samples.length;
    updateObjectPosition(obj);
});
uiContainer.appendChild(advanceButton);

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.addEventListener('click', () => {
    index = 0;
    updateObjectPosition(obj);
});
uiContainer.appendChild(resetButton);

const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
});
uiContainer.appendChild(pauseButton);

document.body.appendChild(uiContainer);

// Initial render of curve
regenerateCurve();

// Prevent default right-click menu everywhere in the document
document.addEventListener('contextmenu', event => event.preventDefault());

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let contextMenuVisible = false;

function onMouseClick(event) {
    // Normalize mouse coordinates for raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (event.button === 2) {  // Right-click
        const intersects = raycaster.intersectObjects(scene.children.filter(child => !child.isLine));
        if (intersects.length > 0) {
            selectedObject = intersects[0].object;
            showContextMenu(event.clientX, event.clientY);
            event.preventDefault();
        } else if (contextMenuVisible) {
            hideContextMenu();
        }
        // Stop propagation if inside context menu
        if (event.target.closest("#contextMenu")) {
            event.stopImmediatePropagation();
        }
    }
}

function showContextMenu(x, y) {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenuVisible = true;

    document.getElementById('positionInput').addEventListener('change', (event) => {
        const [x, y, z] = event.target.value.split(',').map(parseFloat);
        selectedObject.position.set(x, y, z);
        regenerateCurve();  // This will update the curve and ensure it remains attached
        renderer.render(scene, camera);
    });    
    document.getElementById('scaleInput').value = `${selectedObject.scale.x.toFixed(2)}, ${selectedObject.scale.y.toFixed(2)}, ${selectedObject.scale.z.toFixed(2)}`;
    document.getElementById('rotationInput').value = `${selectedObject.rotation.x.toFixed(2)}, ${selectedObject.rotation.y.toFixed(2)}, ${selectedObject.rotation.z.toFixed(2)}`;
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
    contextMenuVisible = false;
}

// Update the object's properties based on the input values
document.getElementById('resetBtn').addEventListener('click', () => {
    selectedObject.position.set(0, 0, 0);
    selectedObject.scale.set(1, 1, 1);
    selectedObject.rotation.set(0, 0, 0);
    regenerateCurve(); // Reset curve
    hideContextMenu();
    renderer.render(scene, camera);
});

document.getElementById('deleteBtn').addEventListener('click', () => {
    scene.remove(selectedObject);
    selectedObject = null;
    hideContextMenu();
    renderer.render(scene, camera);
});

document.getElementById('positionInput').addEventListener('change', (event) => {
    const [x, y, z] = event.target.value.split(',').map(parseFloat);
    selectedObject.position.set(x, y, z);
    followingPath = false; // Stop following the path when manually setting position

    samples = generateSamples(t1, t2, N, selectedObject.position); // Regenerate samples from new position
    const path = drawCurve(scene, samples);
    scene.add(path);
    renderer.render(scene, camera);
});

document.getElementById('scaleInput').addEventListener('change', (event) => {
    const [x, y, z] = event.target.value.split(',').map(parseFloat);
    selectedObject.scale.set(x, y, z);
    renderer.render(scene, camera);
});

document.getElementById('rotationInput').addEventListener('change', (event) => {
    const [x, y, z] = event.target.value.split(',').map(parseFloat);
    selectedObject.rotation.set(x, y, z);
    renderer.render(scene, camera);
});

document.addEventListener('mousedown', onMouseClick);

let lastTime = Date.now();

// Animate the object
function animate() {
    requestAnimationFrame(animate);

    if (selectedObject && followingPath && !paused) {
        index = (index + speed) % samples.length;
        updateObjectPosition(selectedObject);
    }
    
    renderer.render(scene, camera);
}
animate();
