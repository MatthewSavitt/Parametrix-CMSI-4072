export function createPlaybackHUD(animationManager) {
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
    
    // Start time label
    const startTimeLabel = document.createElement('span');
    startTimeLabel.textContent = animationManager.startTime.toFixed(1);
    startTimeLabel.style.marginRight = '5px';
    scrubberContainer.appendChild(startTimeLabel);
    
    // Scrubber input
    const scrubber = document.createElement('input');
    scrubber.type = 'range';
    scrubber.min = animationManager.startTime;
    scrubber.max = animationManager.endTime;
    scrubber.step = 0.01;
    scrubber.value = animationManager.globalTime;
    scrubber.style.flex = '1';

    // Add path visibility toggle
    const pathToggleContainer = document.createElement('div');
    pathToggleContainer.style.marginTop = '10px';
    pathToggleContainer.style.display = 'flex';
    pathToggleContainer.style.alignItems = 'center';
    
    const pathToggleLabel = document.createElement('div');
    pathToggleLabel.textContent = 'Show Paths:';
    pathToggleLabel.style.marginRight = '10px';
    pathToggleContainer.appendChild(pathToggleLabel);
    
    const pathToggleCheckbox = document.createElement('input');
    pathToggleCheckbox.type = 'checkbox';
    pathToggleCheckbox.checked = true; // Default to showing paths
    pathToggleCheckbox.id = 'path-toggle';
    pathToggleContainer.appendChild(pathToggleCheckbox);
    
    pathToggleCheckbox.addEventListener('change', () => {
        // Set global flag
        window.showAnimationPaths = pathToggleCheckbox.checked;
        
        // Toggle visibility of all existing paths
        scene.traverse(obj => {
            if (obj.isAnimationPath) {
                obj.visible = pathToggleCheckbox.checked;
            }
        });
    });
    
    hudContainer.appendChild(pathToggleContainer);
    
    // Set initial global state
    window.showAnimationPaths = true;
    
    // When the scrubber is moved, update the time
    scrubber.addEventListener('input', () => {
        const newTime = parseFloat(scrubber.value);
        animationManager.setTime(newTime);
        timeDisplay.textContent = `Time: ${newTime.toFixed(2)}s`;
    });
    
    scrubberContainer.appendChild(scrubber);
    
    // End time label
    const endTimeLabel = document.createElement('span');
    endTimeLabel.textContent = animationManager.endTime.toFixed(1);
    endTimeLabel.style.marginLeft = '5px';
    scrubberContainer.appendChild(endTimeLabel);
    
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
    document.body.appendChild(hudContainer);
    
    // Update the time display and scrubber every frame
    function updateHUD() {
        if (!animationManager.isPaused) {
            timeDisplay.textContent = `Time: ${animationManager.globalTime.toFixed(2)}s`;
            scrubber.value = animationManager.globalTime;
        }
        
        // Update min/max of scrubber if timeline range changed
        if (parseFloat(scrubber.min) !== animationManager.startTime) {
            scrubber.min = animationManager.startTime;
            startTimeLabel.textContent = animationManager.startTime.toFixed(1);
        }
        
        if (parseFloat(scrubber.max) !== animationManager.endTime) {
            scrubber.max = animationManager.endTime;
            endTimeLabel.textContent = animationManager.endTime.toFixed(1);
        }
        
        requestAnimationFrame(updateHUD);
    }
    
    updateHUD();
}