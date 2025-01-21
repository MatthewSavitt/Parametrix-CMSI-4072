import { createMenuTemplate } from './menuTemplate.js';
import { createCube, addObject } from './objectManager.js';
import * as THREE from './node_modules/three/build/three.module.js';

export function createCubeMenu(scene) {
    // Create the menu template
    const { menuContainer } = createMenuTemplate('🟩', 10, 50);
    document.body.appendChild(menuContainer);
    // Input elements for position, rotation, and scale
    const properties = ['Position', 'Rotation', 'Scale'];
    const inputs = {};
    properties.forEach((property) => {
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

    // Add Cube Button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Cube';
    addButton.style.marginTop = '10px';
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
        // if color
        // if normal
        // if etc
        // --> make mesh color/normal/etc
        const color = colorInput.value;
        const cube = createCube({ position, rotation, scale }); // somehow apply mesh as well, idk if i should do color options first in cube menu 
        addObject(scene, cube);
    });
    menuContainer.appendChild(addButton);
}
