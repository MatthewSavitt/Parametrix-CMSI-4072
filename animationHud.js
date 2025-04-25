
//import gizmo
import { hideGizmo } from './threejs-gizmo.js';
export function createPlaybackHUD(animationManager, scene) {
    // Create a simple HUD for playback controls
    const hudContainer = document.createElement('div');
    hudContainer.style.position = 'absolute';
    hudContainer.style.bottom = '10px';
    hudContainer.style.left = '10px';
    hudContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    hudContainer.style.padding = '10px';
    hudContainer.style.borderRadius = '8px';
    hudContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    hudContainer.style.minWidth = '300px';

    // Time display
    const timeDisplay = document.createElement('div');
    timeDisplay.textContent = 'Time: 0.00s';
    timeDisplay.style.marginBottom = '10px';
    hudContainer.appendChild(timeDisplay);
    
    // Time scrubber
    const scrubberContainer = document.createElement('div');
    scrubberContainer.style.display = 'flex';
    scrubberContainer.style.alignItems = 'center';
    scrubberContainer.style.marginBottom = '10px';

      // Add event listener for animation end
    window.addEventListener('animation-ended', () => {
    playPauseButton.textContent = 'Play';
    });
    
    // Start time input (replacing the label)
    const startTimeInput = document.createElement('input');
    startTimeInput.type = 'number';
    startTimeInput.value = animationManager.startTime.toFixed(2);
    startTimeInput.step = '0.1';
    startTimeInput.style.width = '50px';
    startTimeInput.style.marginRight = '5px';
    startTimeInput.style.padding = '2px';
    startTimeInput.style.textAlign = 'center';
    startTimeInput.addEventListener('input', () => {
        console.log("Start time input changed to:", startTimeInput.value);
        const newStartTime = parseFloat(startTimeInput.value >= 0 ? startTimeInput.value : 0);
        if (!isNaN(newStartTime)) {
            animationManager.startTime = newStartTime;
            
            // Update scrubber min value
            scrubber.min = newStartTime;
            
            // If current time is less than new start time, update it
            if (animationManager.globalTime < newStartTime) {
                animationManager.setTime(newStartTime);
                scrubber.value = newStartTime;
                timeDisplay.textContent = `Time: ${newStartTime.toFixed(2)}s`;
            }
        }
    });
    scrubberContainer.appendChild(startTimeInput);
    
    // Scrubber input
    const scrubber = document.createElement('input');
    scrubber.type = 'range';
    scrubber.min = animationManager.startTime;
    scrubber.max = animationManager.endTime;
    scrubber.step = 0.01;
    scrubber.value = animationManager.globalTime;
    scrubber.style.flex = '1';
    
    // When the scrubber is moved, update the time
    scrubber.addEventListener('input', () => {
        const newTime = parseFloat(scrubber.value);
        animationManager.setTime(newTime);
        timeDisplay.textContent = `Time: ${newTime.toFixed(2)}s`;
    });
    
    scrubberContainer.appendChild(scrubber);
    
    // End time input (replacing the label)
    const endTimeInput = document.createElement('input');
    endTimeInput.type = 'number';
    endTimeInput.value = animationManager.endTime.toFixed(2);
    endTimeInput.step = '0.1';
    endTimeInput.style.width = '50px';
    endTimeInput.style.marginLeft = '5px';
    endTimeInput.style.padding = '2px';
    endTimeInput.style.textAlign = 'center';
    endTimeInput.addEventListener('input', () => {
        console.log("End time input changed to:", endTimeInput.value);
        const newEndTime = parseFloat(endTimeInput.value < startTimeInput.value ? startTimeInput.value : endTimeInput.value);
        if (!isNaN(newEndTime)) {
            animationManager.endTime = newEndTime;
            
            // Update scrubber max value
            scrubber.max = newEndTime;
            if(animationManager.globalTime > newEndTime) {
                animationManager.setTime(newEndTime);
                scrubber.value = newEndTime;
                timeDisplay.textContent = `Time: ${newEndTime.toFixed(2)}s`;
            }
        }
    });
    scrubberContainer.appendChild(endTimeInput);
    
    hudContainer.appendChild(scrubberContainer);
    
    // Playback controls
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';

    const playPauseButton = document.createElement('button');
    playPauseButton.textContent = 'Play';
    playPauseButton.style.flex = '1';
    playPauseButton.style.marginRight = '5px';
    playPauseButton.addEventListener('click', () => {
        if( animationManager.globalTime >= animationManager.endTime && !animationManager.loop) {
            //had to change the referred animationmanager qualities directly... probably bad, might need to change later
            animationManager.setTime(animationManager.startTime);
            scrubber.value = animationManager.startTime;
            timeDisplay.textContent = `Time: ${animationManager.startTime.toFixed(2)}s`;
        }
        animationManager.togglePlayPause();
        playPauseButton.textContent = animationManager.isPaused ? 'Play' : 'Pause';
    });
    controlsContainer.appendChild(playPauseButton);

    const loopToggle = document.createElement('button');
    loopToggle.textContent = 'Loop: On';
    loopToggle.style.flex = '1';
    loopToggle.style.marginRight = '5px';
    loopToggle.addEventListener('click', () => {
        animationManager.toggleLoop();
        loopToggle.textContent = `Loop: ${animationManager.loop ? 'On' : 'Off'}`;
    });
    controlsContainer.appendChild(loopToggle);
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.flex = '1';
    resetButton.addEventListener('click', () => {
        animationManager.setTime(animationManager.startTime);
        scrubber.value = animationManager.startTime;
        timeDisplay.textContent = `Time: ${animationManager.startTime.toFixed(2)}s`;
    });
    controlsContainer.appendChild(resetButton);

    hudContainer.appendChild(controlsContainer);
    
    // Add path visibility toggle
    const pathToggleContainer = document.createElement('div');
    pathToggleContainer.style.marginTop = '10px';
    pathToggleContainer.style.display = 'flex';
    pathToggleContainer.style.alignItems = 'center';

    // Create image container with text
    const pathLabelContent = document.createElement('div');
    pathLabelContent.style.display = 'flex';
    pathLabelContent.style.alignItems = 'center';
    pathLabelContent.style.marginRight = '10px';

    // Create path icon image
    const pathIcon = document.createElement('img');
    pathIcon.src = './paths.png';
    pathIcon.width = 20;
    pathIcon.height = 20;
    pathIcon.style.marginRight = '5px';

    // Create label text
    const pathToggleLabel = document.createElement('div');
    pathToggleLabel.textContent = 'Show Paths:';

    // Assemble the label (icon + text)
    pathLabelContent.appendChild(pathIcon);
    pathLabelContent.appendChild(pathToggleLabel);

    // Create checkbox
    const pathToggleCheckbox = document.createElement('input');
    pathToggleCheckbox.type = 'checkbox';
    pathToggleCheckbox.checked = true; // Default to showing paths
    pathToggleCheckbox.id = 'path-toggle';

    // Listen for project loading to update UI state
    window.addEventListener('project-loaded', (event) => {
        if (event.detail && event.detail.showAnimationPaths !== undefined) {
            window.showAnimationPaths = event.detail.showAnimationPaths;
            togglePathsButton.textContent = window.showAnimationPaths ? '👁️ Paths: ON' : '👁️ Paths: OFF';
            
            // Update visibility of all paths
            scene.traverse(obj => {
                if (obj.isAnimationPath) {
                    obj.visible = window.showAnimationPaths;
                }
            });
        }
    });

    // Add components to container in correct order
    pathToggleContainer.appendChild(pathLabelContent);
    pathToggleContainer.appendChild(pathToggleCheckbox);
    // Create gizmo toggle control
    const gizmoToggleContainer = document.createElement('div');
    gizmoToggleContainer.style.marginTop = '10px';
    gizmoToggleContainer.style.display = 'flex';
    gizmoToggleContainer.style.alignItems = 'center';
    
    const gizmoToggleCheckbox = document.createElement('input');
    gizmoToggleCheckbox.type = 'checkbox';
    gizmoToggleCheckbox.id = 'gizmo-toggle';
    gizmoToggleCheckbox.checked = true; // Default to visible
    
    //create gizmo icon image
    const gizmoIcon = document.createElement('img');
    gizmoIcon.src = './gizmo.PNG';
    gizmoIcon.width = 20;
    gizmoIcon.height = 20;
    gizmoIcon.style.marginLeft = '5px';

    const gizmoToggleLabel = document.createElement('label');
    gizmoToggleLabel.htmlFor = 'gizmo-toggle';
    gizmoToggleLabel.textContent = 'Show Gizmo:';
    gizmoToggleLabel.style.marginRight = '10px';
    
    // Create label container with icon and text
    const gizmoLabelContent = document.createElement('div');
    gizmoLabelContent.style.display = 'flex';
    gizmoLabelContent.style.alignItems = 'right';
    gizmoLabelContent.style.marginRight = '10px';
    gizmoLabelContent.appendChild(gizmoIcon);
    gizmoLabelContent.appendChild(gizmoToggleLabel);
    gizmoToggleContainer.appendChild(gizmoLabelContent);
    // Append the checkbox to the label container
    gizmoToggleContainer.appendChild(gizmoToggleLabel);
    gizmoToggleContainer.appendChild(gizmoToggleCheckbox);
    
    pathToggleCheckbox.addEventListener('change', () => {
        // Set global flag
        window.showAnimationPaths = pathToggleCheckbox.checked;
        
    // Toggle visibility of all existing paths
    if (scene) {
        scene.traverse(obj => {
            if (obj.isAnimationPath) {
                obj.visible = pathToggleCheckbox.checked;
            }
        });
    }});
    
    gizmoToggleCheckbox.addEventListener('change', () => {
        // Toggle visibility of all existing gizmos
        if (scene) {
            scene.traverse(obj => {
                if (obj.isGizmo) {
                    hideGizmo(obj);
                }
            });
        }
    });
    //div to set show path and show gizmo side by side
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.justifyContent = 'space-between';
    toggleContainer.appendChild(pathToggleContainer);
    toggleContainer.appendChild(gizmoToggleContainer);
    hudContainer.appendChild(toggleContainer);


    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // gizmoToggleCheckbox.addEventListener('change', () => {
    //     // use hideGizmo function to toggle visibility of gizmo
    //     hideGizmo(gizmoToggleCheckbox.checked);
    // });
    // hudContainer.appendChild(gizmoToggleContainer);
        
    // Set initial global state
    window.showAnimationPaths = true;
    
    document.body.appendChild(hudContainer);
    
    // Update the time display and scrubber every frame
    function updateHUD() {
        // if ( scrubber.value >= scrubber.max && !animationManager.loop) {
        //     playPauseButton.textContent = 'Play';
        // }
        
        if (!animationManager.isPaused) {
            timeDisplay.textContent = `Time: ${animationManager.globalTime.toFixed(2)}s`;
            scrubber.value = animationManager.globalTime;
        }
        
        // Update input fields if timeline range changed externally
        if (Math.abs(parseFloat(startTimeInput.value) - animationManager.startTime) > 0.01) {
            startTimeInput.value = animationManager.startTime.toFixed(2);
            scrubber.min = animationManager.startTime;
        }
        
        if (Math.abs(parseFloat(endTimeInput.value) - animationManager.endTime) > 0.01) {
            endTimeInput.value = animationManager.endTime.toFixed(2);
            scrubber.max = animationManager.endTime;
        }
        
        requestAnimationFrame(updateHUD);
    }
    
    updateHUD();
}