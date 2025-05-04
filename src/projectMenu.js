import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';
import { createMenuTemplate } from './menuTemplate.js';
import { ProjectManager } from './projectManager.js';
import { applyHoverEffects } from './buttonHover.js';

export function createProjectMenu(scene, animationManager, getActiveCamera) {
    const projectManager = new ProjectManager(scene, animationManager, getActiveCamera);
    
    // Create the menu template with floppy disk emoji
    const { menuContainer, toggleButton } = createMenuTemplate('💾', 10, 276);
    document.body.appendChild(menuContainer);
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Project';
    title.style.marginTop = '20px';
    menuContainer.appendChild(title);
    
    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Project';
    saveButton.style.width = '100%';
    saveButton.style.padding = '10px';
    saveButton.style.marginBottom = '10px';
    saveButton.addEventListener('click', () => {
        projectManager.downloadProject();
    });
    applyHoverEffects(saveButton);
    menuContainer.appendChild(saveButton);
    
    // Load button
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load Project';
    loadButton.style.width = '100%';
    loadButton.style.padding = '10px';
    loadButton.style.marginBottom = '10px';
    
    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await projectManager.loadFromFile(file);
                alert('Project loaded successfully!');
            } catch (error) {
                console.error('Error loading project:', error);
                alert('Error loading project. Please check the file format.');
            }
        }
        // Reset file input
        fileInput.value = '';
    });
    
    loadButton.addEventListener('click', () => {
        fileInput.click();
    });
    applyHoverEffects(loadButton);
    menuContainer.appendChild(loadButton);
    menuContainer.appendChild(fileInput);
    
    return { menuContainer, toggleButton };
}