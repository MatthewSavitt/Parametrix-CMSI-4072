import * as THREE from './node_modules/three/build/three.module.js';
import { regenerateCurve } from './curve.js';
import { addObject } from './objectManager.js';

export function initializeObjectEditMenu(scene, camera, renderer) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;
    let outlineMesh = null;

    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.id = 'contextMenu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.display = 'none';
    contextMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    contextMenu.style.padding = '10px';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.zIndex = '1000';
    document.body.appendChild(contextMenu);

    // Populate the context menu with inputs
    const properties = ['Position', 'Rotation', 'Scale'];
    const inputs = {};
    properties.forEach((property) => {
        const section = document.createElement('div');
        section.innerHTML = `<h4>${property}</h4>`;
        section.style.marginBottom = '5px';

        ['x', 'y', 'z'].forEach((axis) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '5px';

            const axisLabel = document.createElement('span');
            axisLabel.textContent = `${axis.toUpperCase()}: `;
            wrapper.appendChild(axisLabel);

            const input = document.createElement('input');
            input.type = 'number';
            input.style.width = '50px';
            input.dataset.property = property;
            input.dataset.axis = axis;
            wrapper.appendChild(input);

            if (!inputs[property]) inputs[property] = {};
            inputs[property][axis] = input;

            section.appendChild(wrapper);
        });

        contextMenu.appendChild(section);
    });

    // Apply button logic
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.style.marginTop = '10px';
    applyButton.addEventListener('click', () => {
        if (!selectedObject) return;

        const position = {};
        const rotation = {};
        const scale = {};

        ['x', 'y', 'z'].forEach((axis) => {
            position[axis] = parseFloat(inputs['Position'][axis].value) || 0;
            rotation[axis] = THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'][axis].value) || 0);
            scale[axis] = parseFloat(inputs['Scale'][axis].value) || 1;
        });

        selectedObject.position.set(position.x, position.y, position.z);
        selectedObject.rotation.set(rotation.x, rotation.y, rotation.z);
        selectedObject.scale.set(scale.x, scale.y, scale.z);

        renderer.render(scene, camera);
        updateOutline(selectedObject); // Update the outline
    });
    contextMenu.appendChild(applyButton);

        // Create shared Reset and Delete buttons
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.marginTop = '10px';
        resetButton.addEventListener('click', () => {
            if (!selectedObject) return;
    
            // Reset the object's position, rotation, and scale
            selectedObject.position.set(0, 0, 0);
            selectedObject.rotation.set(0, 0, 0);
            selectedObject.scale.set(1, 1, 1);
        
            clearOutline();
            renderer.render(scene, camera);
            hideContextMenu();
        });
    
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginTop = '10px';
        deleteButton.style.marginLeft = '0px';
        deleteButton.addEventListener('click', () => {
            if (!selectedObject) return;
    
            scene.remove(selectedObject);
            selectedObject = null;
            clearOutline();
            renderer.render(scene, camera);
            hideContextMenu();
        });
    
        // Add hover effects for buttons
        resetButton.addEventListener('mouseenter', () => animateOutlineColor(selectedObject, 0x0000ff)); // Blue
        resetButton.addEventListener('mouseleave', () => animateOutlineColor(selectedObject, 0xffff00)); // Yellow
    
        deleteButton.addEventListener('mouseenter', () => animateOutlineColor(selectedObject, 0xff0000)); // Red
        deleteButton.addEventListener('mouseleave', () => animateOutlineColor(selectedObject, 0xffff00)); // Yellow
    
        contextMenu.appendChild(resetButton);
        contextMenu.appendChild(deleteButton);

    // Raycaster logic with filtering for outline mesh
    // Updated Raycaster logic to filter out the outline mesh
    document.addEventListener('mousedown', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        if (event.button === 2) {
            // Get intersected objects, excluding the outline mesh
            const intersects = raycaster.intersectObjects(
                scene.children.filter((child) => child !== outlineMesh)
            );

            if (intersects.length > 0) {
                selectedObject = intersects[0].object;
                showContextMenu(event.clientX, event.clientY);
                updateOutline(selectedObject);
                event.preventDefault();
            } else {
                hideContextMenu();
                clearOutline();
            }
        }
    });


    document.addEventListener('contextmenu', (event) => event.preventDefault());

    function showContextMenu(x, y) {
        if (!selectedObject) return;

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Populate inputs
        ['Position', 'Rotation', 'Scale'].forEach((property) => {
            ['x', 'y', 'z'].forEach((axis) => {
                const input = inputs[property][axis];
                if (property === 'Position') input.value = selectedObject.position[axis].toFixed(2);
                if (property === 'Rotation') input.value = THREE.MathUtils.radToDeg(selectedObject.rotation[axis]).toFixed(2);
                if (property === 'Scale') input.value = selectedObject.scale[axis].toFixed(2);
            });
        });
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    function updateOutline(object) {
        if (outlineMesh) scene.remove(outlineMesh);

        const outlineGeometry = object.geometry.clone();
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });
        outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outlineMesh.scale.copy(object.scale).multiplyScalar(1.1);
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);

        scene.add(outlineMesh);
    }

    function clearOutline() {
        if (outlineMesh) {
            scene.remove(outlineMesh); // Remove from the scene
            outlineMesh.geometry.dispose(); // Dispose of geometry
            outlineMesh.material.dispose(); // Dispose of material
            outlineMesh = null; // Clear reference
        }
    }
    
    function animateOutlineColor(object, targetColor) {
        if (!outlineMesh) return;

        const initialColor = new THREE.Color(outlineMesh.material.color.getHex());
        const target = new THREE.Color(targetColor);

        const duration = 200;
        const startTime = performance.now();

        function animate(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);

            outlineMesh.material.color.r = THREE.MathUtils.lerp(initialColor.r, target.r, progress);
            outlineMesh.material.color.g = THREE.MathUtils.lerp(initialColor.g, target.g, progress);
            outlineMesh.material.color.b = THREE.MathUtils.lerp(initialColor.b, target.b, progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
}
