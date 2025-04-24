// ui.js
export function createUI() {
    const container = document.createElement('div');
    container.className = 'ui-container';
    container.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(255, 255, 255, 0.8);
        padding: 10px;
        border-radius: 8px;
        display: flex;
        gap: 10px;
        flex-direction: column;
    `;
    return container;
}