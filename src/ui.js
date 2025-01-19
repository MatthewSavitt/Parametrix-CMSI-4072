export function createUI() {
    const uiContainer = document.createElement('div');
    uiContainer.className = 'ui-container';
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    uiContainer.style.padding = '10px';
    uiContainer.style.borderRadius = '8px';
    uiContainer.style.display = 'flex';
    uiContainer.style.gap = '10px';
    
    return uiContainer;
}
