import * as THREE from './node_modules/three/build/three.module.js';
import { createMenuTemplate } from './menuTemplate.js';
import { initializeCameraKeyboardControls } from './cameraKeyboardControls.js';

export function createCameraControls(scene, renderer, initialCamera) {
    let activeCamera = initialCamera;
    let cameraChangeCallbacks = [];
    
    // Create orthographic camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    const orthographicSize = 5; // Controls zoom level
    const orthographicCamera = new THREE.OrthographicCamera(
        -orthographicSize * aspectRatio,  // left
        orthographicSize * aspectRatio,   // right
        orthographicSize,                 // top
        -orthographicSize,                // bottom
        0.1,                              // near
        1000                              // far
    );
    orthographicCamera.position.z = 5;

    // Function to notify about camera changes
    const notifyCameraChange = (camera) => {
        cameraChangeCallbacks.forEach(callback => callback(camera));
    };

    // Store references to UI inputs
    const positionInputs = {};
    const rotationInputs = {};

    // Create the menu template
    const { menuContainer } = createMenuTemplate('📷', 10, 10);
    document.body.appendChild(menuContainer);

    // Add inputs for position
    const positionInputGroup = createDebouncedInputGroup('Position', ['x', 'y', 'z'], (axis, value) => {
        smoothlyMoveCamera(activeCamera, axis, parseFloat(value), 'position');
    });
    positionInputs.x = positionInputGroup.querySelector('input[data-axis="x"]');
    positionInputs.y = positionInputGroup.querySelector('input[data-axis="y"]');
    positionInputs.z = positionInputGroup.querySelector('input[data-axis="z"]');
    menuContainer.appendChild(positionInputGroup);
    
    // Add inputs for rotation
    const rotationInputGroup = createDebouncedInputGroup('Rotation', ['x', 'y', 'z'], (axis, value) => {
        smoothlyMoveCamera(activeCamera, axis, THREE.MathUtils.degToRad(parseFloat(value)), 'rotation');
    });
    rotationInputs.x = rotationInputGroup.querySelector('input[data-axis="x"]');
    rotationInputs.y = rotationInputGroup.querySelector('input[data-axis="y"]');
    rotationInputs.z = rotationInputGroup.querySelector('input[data-axis="z"]');
    menuContainer.appendChild(rotationInputGroup);

    // Initialize UI with current camera values
    updateInputValues();

    // Camera type toggle button
    const cameraTypeToggle = document.createElement('button');
    cameraTypeToggle.textContent = 'Switch to Orthographic';
    cameraTypeToggle.style.marginTop = '10px';
    cameraTypeToggle.style.width = '100%';
    cameraTypeToggle.style.padding = '5px';
    cameraTypeToggle.addEventListener('click', () => {
        if (activeCamera.isPerspectiveCamera) {
            // Switching from perspective to orthographic
            // Copy position and rotation values
            orthographicCamera.position.copy(activeCamera.position);
            orthographicCamera.rotation.copy(activeCamera.rotation);
            
            // Update the active camera
            activeCamera = orthographicCamera;
            cameraTypeToggle.textContent = 'Switch to Perspective';
        } else {
            // Switching from orthographic to perspective
            // Copy position and rotation values
            initialCamera.position.copy(activeCamera.position);
            initialCamera.rotation.copy(activeCamera.rotation);
            
            // Update the active camera
            activeCamera = initialCamera;
            cameraTypeToggle.textContent = 'Switch to Orthographic';
        }
        
        // Update projection matrix
        updateProjectionMatrix(activeCamera);
        
        // Update input fields to show current camera values
        updateInputValues();

        // Notify about camera change
        notifyCameraChange(activeCamera);
    });

    menuContainer.appendChild(cameraTypeToggle);

    // Initialize keyboard controls
    const keyboardControls = initializeCameraKeyboardControls(() => activeCamera);

    // Function to update input values based on camera position/rotation
    function updateInputValues() {
        ['x', 'y', 'z'].forEach(axis => {
            // Update position inputs
            if (positionInputs[axis]) {
                positionInputs[axis].value = activeCamera.position[axis].toFixed(2);
            }
            
            // Update rotation inputs
            if (rotationInputs[axis]) {
                rotationInputs[axis].value = THREE.MathUtils.radToDeg(activeCamera.rotation[axis]).toFixed(2);
            }
        });
    }

    // Update function to be called in animation loop
    function update() {
        // Update keyboard controls
        const result = keyboardControls.update();
        
        // Update input values if camera moved
        if (result && (result.positionChanged || result.rotationChanged)) {
            updateInputValues();
        }
    }

    // Return getter function to dynamically fetch the active camera
    return {
        getActiveCamera: () => activeCamera,
        onCameraChange: (callback) => {
            cameraChangeCallbacks.push(callback);
        },
        update: () => {
            // Update keyboard controls
            const moved = keyboardControls.update();
            
            // Update input values to reflect camera position and 
            if(moved) {
                updateInputValues();
            }
        }
    };
}

// Create input group with debounce for controlling camera attributes
function createDebouncedInputGroup(labelText, axes, onChange) {
    const group = document.createElement('div');
    const label = document.createElement('h4');
    label.textContent = labelText;
    label.style.marginBottom = '8px';
    group.appendChild(label);

    const debouncedHandlers = {};

    axes.forEach((axis) => {
        const inputWrapper = document.createElement('div');
        inputWrapper.style.marginBottom = '8px';
        inputWrapper.style.display = 'flex';
        inputWrapper.style.alignItems = 'center';

        const axisLabel = document.createElement('span');
        axisLabel.textContent = `${axis.toUpperCase()}: `;
        axisLabel.style.width = '20px';
        axisLabel.style.marginRight = '5px';
        inputWrapper.appendChild(axisLabel);

        const input = document.createElement('input');
        input.type = 'number';
        input.style.width = '70px';
        input.style.padding = '3px';
        input.dataset.axis = axis; // Add data attribute to identify axis

        // Debounce the input event
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Prevent updates if the input is empty
            if (value === '') {
                return;
            }

            clearTimeout(debouncedHandlers[axis]);
            debouncedHandlers[axis] = setTimeout(() => {
                onChange(axis, value);
            }, 300);
        });

        inputWrapper.appendChild(input);
        group.appendChild(inputWrapper);
    });

    return group;
}

// Smoothly move the camera to the target position or rotation
function smoothlyMoveCamera(camera, axis, targetValue, property) {
    const duration = 1000; // Duration of the transition in milliseconds
    const startTime = performance.now();
    const startValue = camera[property][axis];

    function animate(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Ensure progress is capped at 1
        const easedProgress = easeInOutQuad(progress);

        // Interpolate between the start and target values
        camera[property][axis] = startValue + (targetValue - startValue) * easedProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// Update projection matrix for the current camera
function updateProjectionMatrix(camera) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    
    if (camera.isPerspectiveCamera) {
        camera.aspect = aspectRatio;
    } else if (camera.isOrthographicCamera) {
        const orthographicSize = 5; // Keep this consistent with the initial value
        camera.left = -orthographicSize * aspectRatio;
        camera.right = orthographicSize * aspectRatio;
        camera.top = orthographicSize;
        camera.bottom = -orthographicSize;
    }
    camera.updateProjectionMatrix();
}

// Easing function for smooth transitions
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}