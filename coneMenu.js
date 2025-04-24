import { createMenuTemplate } from './menuTemplate.js';
import { addObject } from './objectManager.js';
import { createCone } from './objects.js';
import { applyHoverEffects } from './buttonHover.js';

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

export function createConeMenu(scene) {
    // Create the menu template
    const { menuContainer } = createMenuTemplate('🍦', 10, 130);
    document.body.appendChild(menuContainer);
    // Input elements for position, rotation, and scale
    const properties = ['Position', 'Rotation', 'Scale', 'Radial Segments'];
    const inputs = {};
    properties.forEach((property) => {
        // Skip creating standard xyz inputs for Radial Segments
        if (property === 'Radial Segments') {
            const radialSegmentsLabel = document.createElement('h4');
            radialSegmentsLabel.textContent = 'Radial Segments';
            menuContainer.appendChild(radialSegmentsLabel);
    
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '5px';
    
            const input = document.createElement('input');
            input.type = 'number';
            input.style.width = '50px';
            input.value = 8; // Default radial segments
            input.min = 2; // Set minimum value
        
            // Add event listener to validate
            input.addEventListener('change', () => {
                // Ensure value is at least 2
                if (input.value < 2) {
                    input.value = 2;
                }
            });
            wrapper.appendChild(input);
            menuContainer.appendChild(wrapper);
    
            inputs[property] = { segments: input }; // Ensure at least 3 segments
            return; // Skip the rest of the loop for this property
        }
    
        // Standard handling for other properties
        const label = document.createElement('h4');
        label.textContent = property;
        menuContainer.appendChild(label);
    
        ['x', 'y', 'z'].forEach((axis) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '5px';
    
            const axisLabel = document.createElement('span');
            axisLabel.textContent = `${axis.toUpperCase()}: `;
            wrapper.appendChild(axisLabel);
    
            const input = document.createElement('input');
            input.type = 'number';
            input.style.width = '50px';
            input.value = property === 'Scale' ? 1 : 0; // Default scale is 1, others 0
    
            wrapper.appendChild(input);
            menuContainer.appendChild(wrapper);
    
            if (!inputs[property]) inputs[property] = {};
            inputs[property][axis] = input;
        });
    });
    // Add Color Picker
    const colorLabel = document.createElement('h4');
    colorLabel.textContent = 'Color';
    menuContainer.appendChild(colorLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#00ff00'; // Default color
    menuContainer.appendChild(colorInput);

    // Add Cone Button
    const addButton = document.createElement('button');
    addButton.style.width = '100%';
    addButton.style.padding = '8px';
    addButton.style.marginTop = '5px';
    addButton.style.backgroundColor = '#4CAF50';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '4px';
    addButton.style.cursor = 'pointer';
    addButton.textContent = 'Add Cone';
    addButton.style.marginTop = '10px';
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
        const radialSegments = parseInt(inputs['Radial Segments'].segments.value, 10);
        const color = colorInput.value;
        const cone = createCone({ position, rotation, scale, color, radialSegments });
        addObject(scene, cone);
    });
    menuContainer.appendChild(addButton);
}
