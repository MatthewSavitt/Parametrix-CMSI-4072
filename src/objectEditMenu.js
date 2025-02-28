import * as THREE from './node_modules/three/build/three.module.js';
import { parametricFunctions } from './parametricFunctions.js';

export function initializeObjectEditMenu(scene, camera, renderer, animationManager) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;
    let outlineMesh = null;
    
    // Ensure the global path visibility variable is set
    if (window.showAnimationPaths === undefined) {
        window.showAnimationPaths = true;
    }

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
        const funcLabel = document.createElement('div');
        funcLabel.textContent = 'Function:';
        funcLabel.style.marginTop = '5px';
        content.appendChild(funcLabel);
        
        const funcSelect = document.createElement('select');
        funcSelect.style.width = '100%';
        funcSelect.style.marginBottom = '5px';
        Object.keys(parametricFunctions).forEach((funcName) => {
            const option = document.createElement('option');
            option.value = funcName;
            option.textContent = funcName;
            funcSelect.appendChild(option);
        });
        content.appendChild(funcSelect);
        
        // Function parameter editing
        const paramsContainer = document.createElement('div');
        paramsContainer.style.marginTop = '10px';
        paramsContainer.style.marginBottom = '10px';
        paramsContainer.style.padding = '8px';
        paramsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        paramsContainer.style.borderRadius = '4px';

        const paramsHeading = document.createElement('div');
        paramsHeading.textContent = 'Function Parameters:';
        paramsHeading.style.fontWeight = 'bold';
        paramsHeading.style.marginBottom = '5px';
        paramsContainer.appendChild(paramsHeading);

        const paramInputs = {};
        
        // Function to update parameter inputs when function changes
        function updateParamInputs() {
            // Clear existing inputs
            while (paramsContainer.children.length > 1) {
                paramsContainer.removeChild(paramsContainer.lastChild);
            }
            
            // Get current function's parameters
            const funcName = funcSelect.value;
            const params = parametricFunctions[funcName].params;
            
            // Create inputs for each parameter
            Object.keys(params).forEach(paramName => {
                const paramWrapper = document.createElement('div');
                paramWrapper.style.display = 'flex';
                paramWrapper.style.alignItems = 'center';
                paramWrapper.style.marginBottom = '5px';
                
                const paramLabel = document.createElement('div');
                paramLabel.textContent = paramName + ':';
                paramLabel.style.flex = '1';
                paramLabel.style.fontSize = '12px';
                paramWrapper.appendChild(paramLabel);
                
                const paramInput = document.createElement('input');
                paramInput.type = 'number';
                paramInput.step = '0.1';
                paramInput.style.width = '60px';
                paramInput.value = params[paramName];
                paramWrapper.appendChild(paramInput);
                
                paramInputs[paramName] = paramInput;
                paramsContainer.appendChild(paramWrapper);
            });
        }
        
        funcSelect.addEventListener('change', updateParamInputs);
        updateParamInputs(); // Initial update
        content.appendChild(paramsContainer);
        
        // Add axis selection dropdown
        const axisLabel = document.createElement('div');
        axisLabel.textContent = 'Apply to axis:';
        axisLabel.style.marginTop = '5px';
        content.appendChild(axisLabel);
        
        const axisSelect = document.createElement('select');
        axisSelect.style.width = '100%';
        axisSelect.style.marginBottom = '5px';
        ['x', 'y', 'z'].forEach((axis) => {
            const option = document.createElement('option');
            option.value = axis;
            option.textContent = axis.toUpperCase();
            axisSelect.appendChild(option);
        });
        content.appendChild(axisSelect);
    
        // Start and end times
        const timeRangeContainer = document.createElement('div');
        timeRangeContainer.style.display = 'flex';
        timeRangeContainer.style.justifyContent = 'space-between';
        timeRangeContainer.style.marginTop = '10px';
        
        const startContainer = document.createElement('div');
        startContainer.style.flex = '1';
        startContainer.style.marginRight = '5px';
        const startLabel = document.createElement('div');
        startLabel.textContent = 'Start Time (s):';
        startLabel.style.fontSize = '12px';
        startContainer.appendChild(startLabel);
        
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.step = '0.1';
        startInput.style.width = '100%';
        startInput.value = '0'; // Default value
        startContainer.appendChild(startInput);
        
        const endContainer = document.createElement('div');
        endContainer.style.flex = '1';
        endContainer.style.marginLeft = '5px';
        const endLabel = document.createElement('div');
        endLabel.textContent = 'End Time (s):';
        endLabel.style.fontSize = '12px';
        endContainer.appendChild(endLabel);
        
        const endInput = document.createElement('input');
        endInput.type = 'number';
        endInput.step = '0.1';
        endInput.style.width = '100%';
        endInput.value = '6.28'; // Default 2π
        endContainer.appendChild(endInput);
        
        timeRangeContainer.appendChild(startContainer);
        timeRangeContainer.appendChild(endContainer);
        content.appendChild(timeRangeContainer);
    
        // Number of samples (for visualization)
        const samplesLabel = document.createElement('div');
        samplesLabel.textContent = 'Visualization Samples:';
        samplesLabel.style.marginTop = '10px';
        samplesLabel.style.fontSize = '12px';
        content.appendChild(samplesLabel);
        
        const samplesInput = document.createElement('input');
        samplesInput.type = 'number';
        samplesInput.style.width = '100%';
        samplesInput.value = '100'; // Default value
        content.appendChild(samplesInput);
    
        // Apply button for parametric function
        const applyParametricButton = document.createElement('button');
        applyParametricButton.textContent = `Apply to ${property}`;
        applyParametricButton.style.width = '100%';
        applyParametricButton.style.marginTop = '10px';
        
        applyParametricButton.addEventListener('click', () => {
            if (!selectedObject) return;

            const funcName = funcSelect.value;
            const axis = axisSelect.value;
            const startT = parseFloat(startInput.value);
            const endT = parseFloat(endInput.value);
            const numSamples = parseInt(samplesInput.value, 10);

            // Get custom parameter values from inputs
            const params = {};
            Object.keys(paramInputs).forEach(paramName => {
                params[paramName] = parseFloat(paramInputs[paramName].value);
            });

            // Create animation configuration
            const animConfig = {
                property: property.toLowerCase(), // 'position', 'rotation', or 'scale'
                axis: axis,
                startT: startT,
                endT: endT,
                functions: {
                    [axis]: {
                        apply: parametricFunctions[funcName].apply,
                        params: params
                    }
                },
                loop: true
            };
            
            // Add animation to the object
            animationManager.addAnimation(selectedObject, animConfig);

            // Draw the animation path (if applicable)
            if (property.toLowerCase() === 'position') {
                drawAnimationPath(
                    selectedObject, 
                    funcName, 
                    params, 
                    axis, 
                    startT, 
                    endT, 
                    numSamples
                );
            }
            
            // Add visual feedback (the satisfying green text)
            const feedback = document.createElement('div');
            feedback.textContent = `✓ Applied ${funcName} to ${property}.${axis.toUpperCase()}`;
            feedback.style.color = '#00c853'; // Vibrant green
            feedback.style.fontWeight = 'bold';
            feedback.style.marginTop = '10px';
            feedback.style.padding = '5px';
            feedback.style.backgroundColor = 'rgba(0, 200, 83, 0.1)';
            feedback.style.borderRadius = '4px';
            feedback.style.textAlign = 'center';
            content.appendChild(feedback);
            
            // Animate the feedback
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.01;
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    if (content.contains(feedback)) {
                        content.removeChild(feedback);
                    }
                } else {
                    feedback.style.opacity = opacity;
                }
            }, 30);
        });
        
        content.appendChild(applyParametricButton);
        submenu.appendChild(content);
        parametricControls.appendChild(submenu);
    });

    // Function to draw the animation path
    function drawAnimationPath(object, funcName, params, axis, startT, endT, numSamples) {
        // Remove any existing path for this object
        if (object.animationPath) {
            scene.remove(object.animationPath);
            object.animationPath.geometry.dispose();
            object.animationPath.material.dispose();
        }
        
        // Generate points for the animation path taking into account all animations
        const points = [];
        
        // Collect all active animations for this object by axis
        const activeAnimations = {};
        if (object.animations) {
            object.animations.forEach(anim => {
                if (anim.property === 'position') {
                    Object.keys(anim.functions).forEach(axisKey => {
                        activeAnimations[axisKey] = anim.functions[axisKey];
                    });
                }
            });
        }
        
        // Include the new animation we're adding
        activeAnimations[axis] = {
            apply: parametricFunctions[funcName].apply,
            params: params
        };
        
        // Start from the object's current position
        const basePosition = object.position.clone();
        
        // Generate path points considering all active position animations
        for (let i = 0; i < numSamples; i++) {
            const t = startT + (endT - startT) * (i / (numSamples - 1));
            const point = basePosition.clone();
            
            // Apply all active animations for each axis
            ['x', 'y', 'z'].forEach(axisKey => {
                if (activeAnimations[axisKey]) {
                    const { apply, params } = activeAnimations[axisKey];
                    point[axisKey] = apply(t, params);
                }
            });
            
            points.push(point);
        }
        
        // Create a line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xff3366,
            linewidth: 2, 
            transparent: true,
            opacity: 0.8
        });
        
        const line = new THREE.Line(geometry, material);
        line.isAnimationPath = true; // Mark this as an animation path
        line.visible = window.showAnimationPaths !== false; // Set initial visibility
        scene.add(line);
        
        // Store for cleanup
        object.animationPath = line;
        
        // Animate the path to make it more noticeable
        let pulsateDirection = 1;
        let currentOpacity = 0.8;
        
        const pulsateInterval = setInterval(() => {
            currentOpacity += 0.03 * pulsateDirection;
            
            if (currentOpacity >= 1) {
                currentOpacity = 1;
                pulsateDirection = -1;
            } else if (currentOpacity <= 0.4) {
                currentOpacity = 0.4;
                pulsateDirection = 1;
            }
            
            if (object.animationPath) {
                object.animationPath.material.opacity = currentOpacity;
            } else {
                clearInterval(pulsateInterval);
            }
        }, 50);
        
        // Keep the path visible until the object is deselected or deleted
        object.onDeselect = () => {
            if (object.animationPath) {
                scene.remove(object.animationPath);
                object.animationPath.geometry.dispose();
                object.animationPath.material.dispose();
                object.animationPath = null;
                clearInterval(pulsateInterval);
            }
        };
    }

    // Function to redraw all animation paths
    function redrawAllAnimationPaths() {
        // Find all objects with animations
        scene.traverse(obj => {
            // Skip non-mesh objects or objects without animations
            if (!obj.isMesh || !obj.animations || obj.animations.length === 0) return;
            
            // Remove existing animation path
            if (obj.animationPath) {
                scene.remove(obj.animationPath);
                obj.animationPath.geometry.dispose();
                obj.animationPath.material.dispose();
                obj.animationPath = null;
            }
            
            // Check if we have position animations
            const positionAnimations = obj.animations.filter(anim => anim.property === 'position');
            if (positionAnimations.length === 0) return;
            
            // Find time range across all animations
            let minStartT = Infinity;
            let maxEndT = -Infinity;
            
            positionAnimations.forEach(anim => {
                minStartT = Math.min(minStartT, anim.startT);
                maxEndT = Math.max(maxEndT, anim.endT);
            });
            
            // Collect all position animation functions by axis
            const activeAnimations = {};
            positionAnimations.forEach(anim => {
                Object.keys(anim.functions).forEach(axisKey => {
                    activeAnimations[axisKey] = anim.functions[axisKey];
                });
            });
            
            // Draw path with 100 samples
            const numSamples = 100;
            const points = [];
            const basePosition = new THREE.Vector3();
            
            // For mesh objects with geometry, use the object's initial position
            if (obj.position) {
                basePosition.copy(obj.position);
            }
            
            // Generate path considering all active animations
            for (let i = 0; i < numSamples; i++) {
                const t = minStartT + (maxEndT - minStartT) * (i / (numSamples - 1));
                const point = basePosition.clone();
                
                // Apply all active animations for each axis
                ['x', 'y', 'z'].forEach(axisKey => {
                    if (activeAnimations[axisKey]) {
                        const { apply, params } = activeAnimations[axisKey];
                        point[axisKey] = apply(t, params);
                    }
                });
                
                points.push(point);
            }
            
            // Create path
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
                color: 0xff3366,
                linewidth: 2,
                transparent: true,
                opacity: 0.8
            });
            
            const line = new THREE.Line(geometry, material);
            line.isAnimationPath = true;
            line.visible = window.showAnimationPaths !== false;
            scene.add(line);
            
            obj.animationPath = line;
        });
    }

    // Update the outline of the selected object
    function updateOutline(object) {
        clearOutline(); // Clear any existing outline
        
        if (!object || !object.geometry) return;
        
        // Create a new outline
        const outlineGeometry = object.geometry.clone();
        const outlineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        
        outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        
        // Link the outline to follow the object
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);
        outlineMesh.scale.copy(object.scale).multiplyScalar(1.05); // Slightly larger
        
        // Make the outline follow the object by adding an update function
        outlineMesh.update = () => {
            if (selectedObject) {
                outlineMesh.position.copy(selectedObject.position);
                outlineMesh.rotation.copy(selectedObject.rotation);
                outlineMesh.scale.copy(selectedObject.scale).multiplyScalar(1.05);
            }
        };
        
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
        
        // Set color input value
        if (selectedObject.material && selectedObject.material.color) {
            const color = selectedObject.material.color;
            colorInput.value = '#' + color.getHexString();
        }
    }

    // Hide the context menu
    function hideContextMenu() {
        contextMenu.style.display = 'none';
    }
    
    // Expose the redrawAllAnimationPaths function for external use
    return {
        redrawAllAnimationPaths
    };
}