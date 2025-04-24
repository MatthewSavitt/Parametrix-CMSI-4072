import { createMenuTemplate } from './menuTemplate.js';
import { initializeGIFExport } from './exportAnimationToGIF.js';
import { applyHoverEffects } from './buttonHover.js';

export function createExportMenu(scene, animationManager, getActiveCamera, renderer) {
    // Initialize GIF export functionality
    const { exportToGIF } = initializeGIFExport(scene, animationManager, getActiveCamera, renderer);
    
    // Create the menu template with film emoji
    const { menuContainer, toggleButton } = createMenuTemplate('🎞️', 10, 235);
    document.body.appendChild(menuContainer);
    
    // Title
    const title = document.createElement('h3');
    title.textContent = 'Export Animation';
    title.style.marginTop = '20px';
    menuContainer.appendChild(title);
    
    // Settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.style.marginBottom = '15px';
    menuContainer.appendChild(settingsContainer);
    
    // Export mode selection
    const modeContainer = document.createElement('div');
    modeContainer.style.marginBottom = '10px';
    
    const modeLabel = document.createElement('div');
    modeLabel.textContent = 'Export Mode:';
    modeLabel.style.marginBottom = '5px';
    modeContainer.appendChild(modeLabel);
    
    const modeSelect = document.createElement('select');
    modeSelect.style.width = '100%';
    
    const framesOption = document.createElement('option');
    framesOption.value = 'frames';
    framesOption.textContent = 'Frames Per Second';
    modeSelect.appendChild(framesOption);
    
    const samplesOption = document.createElement('option');
    samplesOption.value = 'samples';
    samplesOption.textContent = 'Total Samples';
    modeSelect.appendChild(samplesOption);
    
    modeContainer.appendChild(modeSelect);
    settingsContainer.appendChild(modeContainer);
    
    // Frames per second input
    const fpsContainer = document.createElement('div');
    fpsContainer.style.marginBottom = '10px';
    
    const fpsLabel = document.createElement('div');
    fpsLabel.textContent = 'Frames Per Second:';
    fpsLabel.style.marginBottom = '5px';
    fpsContainer.appendChild(fpsLabel);
    
    const fpsInput = document.createElement('input');
    fpsInput.type = 'number';
    fpsInput.min = '1';
    fpsInput.max = '60';
    fpsInput.value = '30';
    fpsInput.style.width = '100%';
    fpsContainer.appendChild(fpsInput);
    
    settingsContainer.appendChild(fpsContainer);
    
    // Seconds per frame display
    const spfContainer = document.createElement('div');
    spfContainer.style.marginBottom = '10px';
    
    const spfLabel = document.createElement('div');
    spfLabel.textContent = 'Seconds Per Frame:';
    spfLabel.style.marginBottom = '5px';
    spfContainer.appendChild(spfLabel);
    
    const spfDisplay = document.createElement('div');
    spfDisplay.textContent = (1 / parseInt(fpsInput.value)).toFixed(3);
    spfDisplay.style.padding = '5px';
    spfDisplay.style.background = '#f0f0f0';
    spfDisplay.style.border = '1px solid #ccc';
    spfContainer.appendChild(spfDisplay);
    
    settingsContainer.appendChild(spfContainer);
    
    // Total frames / samples input
    const samplesContainer = document.createElement('div');
    samplesContainer.style.display = 'none'; // Hidden initially
    samplesContainer.style.marginBottom = '10px';
    
    const samplesLabel = document.createElement('div');
    samplesLabel.textContent = 'Total Samples:';
    samplesLabel.style.marginBottom = '5px';
    samplesContainer.appendChild(samplesLabel);
    
    const samplesInput = document.createElement('input');
    samplesInput.type = 'number';
    samplesInput.min = '10';
    samplesInput.max = '1000';
    samplesInput.value = '100';
    samplesInput.style.width = '100%';
    samplesContainer.appendChild(samplesInput);
    
    settingsContainer.appendChild(samplesContainer);
    
    // Show paths toggle
    const pathsContainer = document.createElement('div');
    pathsContainer.style.marginBottom = '15px';
    
    const pathsLabel = document.createElement('label');
    pathsLabel.style.display = 'flex';
    pathsLabel.style.alignItems = 'center';
    
    const pathsCheckbox = document.createElement('input');
    pathsCheckbox.type = 'checkbox';
    pathsCheckbox.id = 'show-paths';
    pathsCheckbox.style.marginRight = '8px';
    
    pathsLabel.appendChild(pathsCheckbox);
    pathsLabel.appendChild(document.createTextNode('Show Animation Paths'));
    
    pathsContainer.appendChild(pathsLabel);
    menuContainer.appendChild(pathsContainer);
    
    // Export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export to GIF';
    exportButton.style.width = '100%';
    exportButton.style.padding = '10px';
    exportButton.style.backgroundColor = '#4CAF50';
    exportButton.style.color = 'white';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontWeight = 'bold';
    applyHoverEffects(exportButton);
    
    menuContainer.appendChild(exportButton);
    
    // Event handlers
    modeSelect.addEventListener('change', () => {
        if (modeSelect.value === 'frames') {
            fpsContainer.style.display = 'block';
            spfContainer.style.display = 'block';
            samplesContainer.style.display = 'none';
        } else {
            fpsContainer.style.display = 'none';
            spfContainer.style.display = 'none';
            samplesContainer.style.display = 'block';
        }
    });
    
    fpsInput.addEventListener('input', () => {
        const fps = parseInt(fpsInput.value);
        if (fps > 0) {
            spfDisplay.textContent = (1 / fps).toFixed(3);
        }
    });
    
    exportButton.addEventListener('click', () => {
        const options = {
            frameMode: modeSelect.value,
            framesPerSecond: parseInt(fpsInput.value),
            totalFrames: parseInt(samplesInput.value),
            showPaths: pathsCheckbox.checked
        };
        
        exportToGIF(options);
    });
    
    return { menuContainer, toggleButton };
}