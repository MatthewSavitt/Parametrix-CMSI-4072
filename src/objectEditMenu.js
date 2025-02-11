import * as THREE from './node_modules/three/build/three.module.js';
import { parametricFunctions } from './parametricFunctions.js'; // Import parametricFunctions

export function initializeObjectEditMenu(scene, camera, renderer, animationManager) {
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
    contextMenu.style.display = 'flex'; // Use flexbox for two columns
    document.body.appendChild(contextMenu);

    // Left column for position, rotation, scale, and color
    const leftColumn = document.createElement('div');
    leftColumn.style.flex = '1';
    leftColumn.style.marginRight = '10px'; // Add some spacing between columns
    contextMenu.appendChild(leftColumn);

    // Right column for parametric function controls
    const rightColumn = document.createElement('div');
    rightColumn.style.flex = '1';
    contextMenu.appendChild(rightColumn);

    // Populate the left column with inputs for position, rotation, scale, and color
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

        leftColumn.appendChild(section);
    });

    // Add Color Picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#00ff00'; // Default color
    const colorLabel = document.createElement('h4');
    colorLabel.textContent = 'Color';
    leftColumn.appendChild(colorLabel);
    leftColumn.appendChild(colorInput);

    // Apply button for left column
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.style.marginTop = '10px';
    applyButton.addEventListener('click', () => {
        if (!selectedObject) return;

        const position = {};
        const rotation = {};
        const scale = {};
        const color = colorInput.value;

        ['x', 'y', 'z'].forEach((axis) => {
            position[axis] = parseFloat(inputs['Position'][axis].value) || 0;
            rotation[axis] = THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'][axis].value) || 0);
            scale[axis] = parseFloat(inputs['Scale'][axis].value) || 1;
        });

        selectedObject.position.set(position.x, position.y, position.z);
        selectedObject.rotation.set(rotation.x, rotation.y, rotation.z);
        selectedObject.scale.set(scale.x, scale.y, scale.z);
        selectedObject.material.color.set(color);

        renderer.render(scene, camera);
        updateOutline(selectedObject); // Update the outline
    });
    leftColumn.appendChild(applyButton);

    // Reset and Delete buttons
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.marginTop = '10px';
    resetButton.addEventListener('click', () => {
        if (!selectedObject) return;

        // Reset the object's position, rotation, and scale
        selectedObject.position.set(0, 0, 0);
        selectedObject.rotation.set(0, 0, 0);
        selectedObject.scale.set(1, 1, 1);
        selectedObject.material.color.set(0x00ff00); // Reset color

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

    leftColumn.appendChild(resetButton);
    leftColumn.appendChild(deleteButton);

    // Right column: Parametric function controls
    const parametricControls = document.createElement('div');
    parametricControls.innerHTML = '<h4>Parametric Functions</h4>';
    rightColumn.appendChild(parametricControls);

    // Add collapsible submenus for position, rotation, and scale
    const submenus = ['Position', 'Rotation', 'Scale'];
    submenus.forEach((property) => {
        const submenu = document.createElement('div');
        submenu.innerHTML = `<h5>${property} Functions</h5>`;
        submenu.style.marginBottom = '10px';

        // Add a button to toggle the submenu
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Toggle';
        toggleButton.style.marginBottom = '5px';
        toggleButton.addEventListener('click', () => {
            const content = submenu.querySelector('.submenu-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        submenu.appendChild(toggleButton);

        // Add content for the submenu
        const content = document.createElement('div');
        content.className = 'submenu-content';
        content.style.display = 'none'; // Initially hidden

        // Function selection
        const funcSelect = document.createElement('select');
        Object.keys(parametricFunctions).forEach((funcName) => {
            const option = document.createElement('option');
            option.value = funcName;
            option.textContent = funcName;
            funcSelect.appendChild(option);
        });
        content.appendChild(funcSelect);

        // Start and end values
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.placeholder = 'Start value';
        content.appendChild(startInput);

        const endInput = document.createElement('input');
        endInput.type = 'number';
        endInput.placeholder = 'End value';
        content.appendChild(endInput);

        // Number of samples
        const samplesInput = document.createElement('input');
        samplesInput.type = 'number';
        samplesInput.placeholder = 'Number of samples';
        content.appendChild(samplesInput);

        // Step rate
        const stepRateInput = document.createElement('input');
        stepRateInput.type = 'number';
        stepRateInput.placeholder = 'Step rate';
        content.appendChild(stepRateInput);

        // Apply button for parametric function
        const applyParametricButton = document.createElement('button');
        applyParametricButton.textContent = `Apply to ${property}`;
        applyParametricButton.addEventListener('click', () => {
            if (!selectedObject) return;

            const funcName = funcSelect.value;
            const startT = parseFloat(startInput.value);
            const endT = parseFloat(endInput.value);
            const numSamples = parseInt(samplesInput.value, 10);
            const stepRate = parseInt(stepRateInput.value, 10);

            const params = parametricFunctions[funcName].params;
            animationManager.addParametricAnimation(selectedObject, funcName, params, startT, endT, numSamples, stepRate);

            // Draw the animation path
            drawAnimationPath(selectedObject, funcName, params, startT, endT, numSamples);
        });
        content.appendChild(applyParametricButton);

        submenu.appendChild(content);
        parametricControls.appendChild(submenu);
    });

    // Function to draw the animation path
    function drawAnimationPath(object, funcName, params, startT, endT, numSamples) {
        const samples = animationManager.generateSamples(funcName, params, startT, endT, numSamples, 1);
        const points = samples.map((sample) => new THREE.Vector3(sample.x, sample.y, sample.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    }

    // Prevent default right-click behavior
    document.addEventListener('contextmenu', (event) => event.preventDefault());

    // Handle right-click to show the context menu
    document.addEventListener('mousedown', (event) => {
        if (event.button === 2) { // Right-click
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // Get intersected objects, excluding the outline mesh
            const intersects = raycaster.intersectObjects(
                scene.children.filter((child) => child !== outlineMesh)
            );

            if (intersects.length > 0) {
                selectedObject = intersects[0].object;
                showContextMenu(event.clientX, event.clientY);
                updateOutline(selectedObject);
            } else {
                hideContextMenu();
                clearOutline();
            }
        }
    });

    // Show the context menu at the specified position
    function showContextMenu(x, y) {
        if (!selectedObject) return;

        contextMenu.style.display = 'flex'; // Use flexbox for two columns
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        // Adjust position if the menu overflows below the viewport
        const rect = contextMenu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.bottom > viewportHeight) {
            // Move the menu up to fit within the viewport
            const overflow = rect.bottom - viewportHeight;
            contextMenu.style.top = `${y - overflow}px`;
        }

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

    // Hide the context menu
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }

    // Update the outline of the selected object
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

    // Clear the outline
    function clearOutline() {
        if (outlineMesh) {
            scene.remove(outlineMesh); // Remove from the scene
            outlineMesh.geometry.dispose(); // Dispose of geometry
            outlineMesh.material.dispose(); // Dispose of material
            outlineMesh = null; // Clear reference
        }
    }

    // Animate the outline color
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