export function createPlaybackHUD(animationManager) {
    const hudContainer = document.createElement('div');
    hudContainer.style.position = 'absolute';
    hudContainer.style.bottom = '10px';
    hudContainer.style.left = '10px';
    hudContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    hudContainer.style.padding = '10px';
    hudContainer.style.borderRadius = '8px';
    hudContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    const playPauseButton = document.createElement('button');
    playPauseButton.textContent = 'Play';
    playPauseButton.addEventListener('click', () => {
        animationManager.togglePlayPause();
        playPauseButton.textContent = animationManager.isPaused ? 'Play' : 'Pause';
    });
    hudContainer.appendChild(playPauseButton);

    const loopToggle = document.createElement('button');
    loopToggle.textContent = 'Loop: On';
    loopToggle.style.marginLeft = '10px';
    loopToggle.addEventListener('click', () => {
        animationManager.toggleLoop();
        loopToggle.textContent = `Loop: ${animationManager.loop ? 'On' : 'Off'}`;
    });
    hudContainer.appendChild(loopToggle);

    document.body.appendChild(hudContainer);
}
