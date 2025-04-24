import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';
import { createMenuTemplate } from './menuTemplate.js';
import { initializeCameraKeyboardControls } from './cameraKeyboardControls.js';

export function createCameraControls(scene, renderer, initialCamera) {
    let activeCamera = initialCamera;
    let cameraChangeCallbacks = [];
    let objectEditorRef = null;

    function setObjectEditor(objectEditor) {
        objectEditorRef = objectEditor;
    }
    
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
    menuContainer.style.width = '130px';

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

    const resetCameraRotationButton = document.createElement('button');
    resetCameraRotationButton.textContent = 'Reset Rotation';
    resetCameraRotationButton.style.width = '100%';
    resetCameraRotationButton.style.padding = '5px';
    resetCameraRotationButton.addEventListener('click', () => {
        smoothlyMoveCamera(activeCamera, 'x', 0, 'rotation', 200);
        smoothlyMoveCamera(activeCamera, 'y', 0, 'rotation', 200);
        smoothlyMoveCamera(activeCamera, 'z', 0, 'rotation', 200);
        updateInputValues();
    });
    menuContainer.appendChild(resetCameraRotationButton);

    const resetCameraPositionButton = document.createElement('button');
    resetCameraPositionButton.textContent = 'Reset Position';
    resetCameraPositionButton.style.width = '100%';
    resetCameraPositionButton.style.padding = '5px';
    resetCameraPositionButton.addEventListener('click', () => {
        smoothlyMoveCamera(activeCamera, 'x', 0, 'position', 200);
        smoothlyMoveCamera(activeCamera, 'y', 0, 'position', 200);
        smoothlyMoveCamera(activeCamera, 'z', 5, 'position', 200);
        updateInputValues();
    });
    menuContainer.appendChild(resetCameraPositionButton);
    
    // Initialize keyboard controls
    const keyboardControls = initializeCameraKeyboardControls(() => activeCamera, () => objectEditorRef);

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
        smoothlyMoveCameraXYZ,
        smoothlyLookAt,
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
        },
        setObjectEditor
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
export function smoothlyMoveCamera(camera, axis, targetValue, property, durationInput) { //optional duration parameter
    const duration = durationInput ? durationInput : 1000; // Duration of the transition in milliseconds
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

// Update smoothlyMoveCamera to return a Promise
export function smoothlyMoveCameraXYZ(camera, targetPosition, durationInput = 1000) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const startPosition = camera.position.clone();
        
        function animate(time) {
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / durationInput, 1);
            const easedProgress = easeInOutQuad(progress);

            // Interpolate all three dimensions at once
            camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easedProgress;
            camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easedProgress;
            camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easedProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve(); // Resolve the promise when animation is complete
            }
        }

        requestAnimationFrame(animate);
    });
}

// Function to smoothly rotate the camera to look at a target
export function smoothlyLookAt(camera, targetPosition, duration = 1000) {
    return new Promise((resolve) => {
        // Store the starting quaternion (current orientation)
        const startQuaternion = camera.quaternion.clone();
        // Create a temporary camera at the same position
        const tempCamera = camera.clone();
        // Reset rotation to ensure we're not inheriting any previous rotation
        tempCamera.rotation.set(0, 0, 0); 
        // Look directly at the target
        tempCamera.lookAt(targetPosition);
        // Get the resulting quaternion
        const targetQuaternion = tempCamera.quaternion.clone();
        const startTime = performance.now();
        
        function animate(time) {
            const elapsedTime = time - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easedProgress = easeInOutQuad(progress);
            
            // Use the instance slerp method
            camera.quaternion.copy(startQuaternion).slerp(targetQuaternion, easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Just to make absolutely sure we're looking at the target
                camera.lookAt(targetPosition);
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
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