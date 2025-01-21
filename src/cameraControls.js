import * as THREE from './node_modules/three/build/three.module.js';
import { createMenuTemplate } from './menuTemplate.js';

export function createCameraControls(scene, renderer, initialCamera) {
    let activeCamera = initialCamera;

    // Create orthographic camera
    const orthographicCamera = new THREE.OrthographicCamera(
        window.innerWidth / -100,
        window.innerWidth / 100,
        window.innerHeight / 100,
        window.innerHeight / -100,
        0.1,
        1000
    );
    orthographicCamera.position.z = 5;

    // Create the menu template
    const { menuContainer } = createMenuTemplate('📷', 10, 10);
    document.body.appendChild(menuContainer);
    // Transformation values for each property
    const transformValues = {
        position: { x: activeCamera.position.x, y: activeCamera.position.y, z: activeCamera.position.z },
        rotation: { x: activeCamera.rotation.x, y: activeCamera.rotation.y, z: activeCamera.rotation.z },
    };

    // Add inputs for position and rotation
    const positionInputs = createDebouncedInputGroup('Position', ['x', 'y', 'z'], (axis, value) => {
        smoothlyMoveCamera(activeCamera, axis, parseFloat(value), 'position');
    });

    const rotationInputs = createDebouncedInputGroup('Rotation', ['x', 'y', 'z'], (axis, value) => {
        smoothlyMoveCamera(activeCamera, axis, THREE.MathUtils.degToRad(parseFloat(value)), 'rotation');
    });

    // Camera type toggle button
    const cameraTypeToggle = document.createElement('button');
    cameraTypeToggle.textContent = 'Switch to Orthographic';
    cameraTypeToggle.style.marginTop = '10px';
    cameraTypeToggle.addEventListener('click', () => {
        if (activeCamera.isPerspectiveCamera) {
            activeCamera = orthographicCamera;
            activeCamera.position.z = 5;
            cameraTypeToggle.textContent = 'Switch to Perspective';
        } else {
            activeCamera = initialCamera;
            cameraTypeToggle.textContent = 'Switch to Orthographic';
        }
        updateProjectionMatrix(activeCamera);
    });

    menuContainer.appendChild(positionInputs);
    menuContainer.appendChild(rotationInputs);
    menuContainer.appendChild(cameraTypeToggle);

    // Return a getter function to dynamically fetch the active camera
    return () => activeCamera;
}

// Create input group with debounce for controlling camera attributes
function createDebouncedInputGroup(labelText, axes, onChange) {
    const group = document.createElement('div');
    const label = document.createElement('h4');
    label.textContent = labelText;
    group.appendChild(label);

    const debouncedHandlers = {};

    axes.forEach((axis) => {
        const inputWrapper = document.createElement('div');
        inputWrapper.style.marginBottom = '5px';

        const axisLabel = document.createElement('span');
        axisLabel.textContent = `${axis.toUpperCase()}: `;
        inputWrapper.appendChild(axisLabel);

        const input = document.createElement('input');
        input.type = 'number';
        input.style.width = '50px';

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
    if (camera.isPerspectiveCamera) {
        camera.aspect = window.innerWidth / window.innerHeight;
    } else if (camera.isOrthographicCamera) {
        camera.left = window.innerWidth / -100;
        camera.right = window.innerWidth / 100;
        camera.top = window.innerHeight / 100;
        camera.bottom = window.innerHeight / -100;
    }
    camera.updateProjectionMatrix();
}

// Easing function for smooth transitions
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
