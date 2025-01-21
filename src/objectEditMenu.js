import * as THREE from './node_modules/three/build/three.module.js';
import { regenerateCurve } from './curve.js';

export function initializeObjectEditMenu(scene, camera, renderer) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;
    let contextMenuVisible = false;

    // Create context menu container
    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.display = 'none';
    contextMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    contextMenu.style.border = '1px solid #ccc';
    contextMenu.style.padding = '10px';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.zIndex = '1000';

    // Create inputs for Position, Rotation, and Scale
    const properties = ['Position', 'Rotation', 'Scale'];
    const inputs = {};
    properties.forEach((property) => {
        const label = document.createElement('h4');
        label.textContent = property;
        contextMenu.appendChild(label);

        ['x', 'y', 'z'].forEach((axis) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '5px';

            const axisLabel = document.createElement('span');
            axisLabel.textContent = `${axis.toUpperCase()}: `;
            wrapper.appendChild(axisLabel);

            const input = document.createElement('input');
            input.type = 'number';
            input.style.width = '50px';

            wrapper.appendChild(input);
            contextMenu.appendChild(wrapper);

            if (!inputs[property]) inputs[property] = {};
            inputs[property][axis] = input;
        });
    });

    // Apply Changes Button
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.style.marginTop = '10px';
    applyButton.addEventListener('click', () => {
        if (!selectedObject) return;

        const position = {
            x: parseFloat(inputs['Position'].x.value) || 0,
            y: parseFloat(inputs['Position'].y.value) || 0,
            z: parseFloat(inputs['Position'].z.value) || 0,
        };

        const rotation = {
            x: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].x.value) || 0),
            y: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].y.value) || 0),
            z: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].z.value) || 0),
        };

        const scale = {
            x: parseFloat(inputs['Scale'].x.value) || 1,
            y: parseFloat(inputs['Scale'].y.value) || 1,
            z: parseFloat(inputs['Scale'].z.value) || 1,
        };

        // Update selected object's properties
        selectedObject.position.set(position.x, position.y, position.z);
        selectedObject.rotation.set(rotation.x, rotation.y, rotation.z);
        selectedObject.scale.set(scale.x, scale.y, scale.z);

        renderer.render(scene, camera);
        hideContextMenu();
    });
    contextMenu.appendChild(applyButton);

    // Reset and Delete Buttons
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.marginTop = '5px';
    resetButton.addEventListener('click', () => {
        if (!selectedObject) return;

        selectedObject.position.set(0, 0, 0);
        selectedObject.rotation.set(0, 0, 0);
        selectedObject.scale.set(1, 1, 1);

        renderer.render(scene, camera);
        hideContextMenu();
    });
    contextMenu.appendChild(resetButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginTop = '5px';
    deleteButton.addEventListener('click', () => {
        if (!selectedObject) return;

        scene.remove(selectedObject);
        selectedObject = null;
        renderer.render(scene, camera);
        hideContextMenu();
    });
    contextMenu.appendChild(deleteButton);

    document.body.appendChild(contextMenu);

    // Show context menu at a specific position
    function showContextMenu(x, y) {
        if (!selectedObject) return;

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenuVisible = true;

        // Populate inputs with current values
        inputs['Position'].x.value = selectedObject.position.x.toFixed(2);
        inputs['Position'].y.value = selectedObject.position.y.toFixed(2);
        inputs['Position'].z.value = selectedObject.position.z.toFixed(2);

        inputs['Rotation'].x.value = THREE.MathUtils.radToDeg(selectedObject.rotation.x).toFixed(2);
        inputs['Rotation'].y.value = THREE.MathUtils.radToDeg(selectedObject.rotation.y).toFixed(2);
        inputs['Rotation'].z.value = THREE.MathUtils.radToDeg(selectedObject.rotation.z).toFixed(2);

        inputs['Scale'].x.value = selectedObject.scale.x.toFixed(2);
        inputs['Scale'].y.value = selectedObject.scale.y.toFixed(2);
        inputs['Scale'].z.value = selectedObject.scale.z.toFixed(2);
    }

    // Hide the context menu
    function hideContextMenu() {
        contextMenu.style.display = 'none';
        contextMenuVisible = false;
    }

    // Raycaster logic to select objects
    document.addEventListener('mousedown', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (event.button === 2) { // Right-click
            const intersects = raycaster.intersectObjects(scene.children.filter(child => !child.isLine));
            if (intersects.length > 0) {
                selectedObject = intersects[0].object;
                showContextMenu(event.clientX, event.clientY);
                event.preventDefault();
            } else if (contextMenuVisible) {
                hideContextMenu();
            }
        }
    });

    // Prevent default right-click menu
    document.addEventListener('contextmenu', (event) => event.preventDefault());
}
