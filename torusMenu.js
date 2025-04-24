import { createMenuTemplate } from './menuTemplate.js';
import { addObject } from './objectManager.js';
import { createTorus } from './objects.js';
import { applyHoverEffects } from './buttonHover.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

export function createTorusMenu(scene) {
    // Create the menu template
    const { menuContainer } = createMenuTemplate('🍩', 10, 160);
    document.body.appendChild(menuContainer);
    menuContainer.style.maxHeight = '85vh'; // Limit height to 85% of viewport height
    menuContainer.style.width = '140px'; // Set a fixed width for the menu
    menuContainer.style.overflowY = 'auto'; // Enable vertical scrolling
    menuContainer.style.paddingBottom = '10px'; // Reduce padding

    // Input elements for position, rotation, and scale
    const properties = ['Position', 'Rotation', 'Scale', 'Tube Radius', 'Radial Segments', 'Tubular Segments', 'Arc'];
    const inputs = {};
    
    // Add standard properties with XYZ in a more compact format
    ['Position', 'Rotation', 'Scale'].forEach((property) => {
        const label = document.createElement('h4');
        label.textContent = property;
        label.style.marginBottom = '2px'; // Reduce margin
        menuContainer.appendChild(label);
        
        // Create a container for all three axes
        const axesContainer = document.createElement('div');
        axesContainer.style.display = 'flex';
        axesContainer.style.justifyContent = 'space-between';
        axesContainer.style.marginBottom = '5px';
        menuContainer.appendChild(axesContainer);
        
        inputs[property] = {};
        
        // Add XYZ inputs in a row
        ['x', 'y', 'z'].forEach((axis) => {
            const wrapper = document.createElement('div');
            wrapper.style.width = '30%';
            
            const axisLabel = document.createElement('span');
            axisLabel.textContent = `${axis.toUpperCase()}:`;
            axisLabel.style.fontSize = '12px';
            wrapper.appendChild(axisLabel);
            
            const input = document.createElement('input');
            input.type = 'number';
            input.style.width = '100%';
            input.value = property === 'Scale' ? 1 : 0;
            
            wrapper.appendChild(input);
            axesContainer.appendChild(wrapper);
            
            inputs[property][axis] = input;
        });
    });
    
    // Add other numeric inputs in a more compact format
    ['Tube Radius', 'Radial Segments', 'Tubular Segments', 'Arc'].forEach((property) => {
        const label = document.createElement('h4');
        label.style.marginBottom = '2px'; // Reduce margin
        
        // Set appropriate labels
        if (property === 'Arc') {
            label.textContent = 'Arc (Degrees)';
        } else if (property === 'Tube Radius') {
            label.textContent = 'Tube Radius';
        } else {
            label.textContent = property === 'Radial Segments' ? 'Radial Segments' : 'Tubular Segments';
        }
        menuContainer.appendChild(label);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.style.width = '100%';
        input.style.marginBottom = '5px';
        
        // Set default values and minimums
        if (property === 'Arc') {
            input.value = 360;
            input.min = 1;
            inputs[property] = { arc: input };
        } else if (property === 'Tube Radius') {
            input.value = 0.2;
            input.min = 0.01;
            inputs[property] = { radius: input };
        } else {
            input.value = property === 'Radial Segments' ? 8 : 10;
            input.min = 3;
            inputs[property] = { segments: input };
        }
        
        // Add validation
        input.addEventListener('change', () => {
            if (parseFloat(input.value) < parseFloat(input.min)) {
                input.value = input.min;
            }
        });
        
        menuContainer.appendChild(input);
    });
    
    // Add Color Picker
    const colorLabel = document.createElement('h4');
    colorLabel.textContent = 'Color';
    colorLabel.style.marginBottom = '2px';
    menuContainer.appendChild(colorLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#00ff00'; // Default color
    colorInput.style.width = '35%';
    colorInput.style.marginBottom = '8px';
    menuContainer.appendChild(colorInput);

    // Add Torus Button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Torus';
    addButton.style.width = '100%';
    addButton.style.padding = '8px';
    addButton.style.marginTop = '5px';
    addButton.style.backgroundColor = '#4CAF50';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.cursor = 'pointer';
    applyHoverEffects(addButton);
    
    addButton.addEventListener('click', () => {
        const position = {
            x: parseFloat(inputs['Position'].x.value),
            y: parseFloat(inputs['Position'].y.value),
            z: parseFloat(inputs['Position'].z.value),
        };

        const rotation = {
            x: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].x.value)),
            y: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].y.value)),
            z: THREE.MathUtils.degToRad(parseFloat(inputs['Rotation'].z.value)),
        };

        const scale = {
            x: parseFloat(inputs['Scale'].x.value),
            y: parseFloat(inputs['Scale'].y.value),
            z: parseFloat(inputs['Scale'].z.value),
        };
        const tubeRadius = parseFloat(inputs['Tube Radius'].radius.value);
        const radialSegments = parseInt(inputs['Radial Segments'].segments.value, 10);
        const tubularSegments = parseInt(inputs['Tubular Segments'].segments.value, 10);
        const arc = THREE.MathUtils.degToRad(parseFloat(inputs['Arc'].arc.value));
        const color = colorInput.value;
        const torus = createTorus({ position, rotation, scale, color, tube: tubeRadius, radialSegments, tubularSegments, arc });
        addObject(scene, torus);
    });
    menuContainer.appendChild(addButton);
}