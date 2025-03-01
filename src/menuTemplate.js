import { menuManager } from './menuManager.js'; // Adjust path as needed
/**
 * Create a stylized menu container with a toggle button.
 * @param {string} emoji - The emoji used for the toggle button.
 * @param {number} top - The top position of the menu and button.
 * @param {number} left - The left position of the menu and button.
 * @returns {object} An object containing the menu container and toggle button.
 */
export function createMenuTemplate(emoji, top, left) {
    // Menu container
    const menuContainer = document.createElement('div');
    menuContainer.style.position = 'absolute';
    menuContainer.style.top = `${top}px`;
    menuContainer.style.left = `${left}px`;
    menuContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    menuContainer.style.padding = '10px';
    menuContainer.style.borderRadius = '8px';
    menuContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    menuContainer.style.display = 'none'; // Initially hidden

    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = emoji;
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.background = 'transparent';
    toggleButton.style.border = 'none';
    toggleButton.style.fontSize = '24px';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = `${top}px`;
    toggleButton.style.left = `${left}px`;
    toggleButton.style.zIndex = '1000';

    // Toggle menu visibility
    toggleButton.addEventListener('click', () => {
        if (menuManager.isMenuActive(menuContainer)) {
            menuManager.closeMenu();
        } else {
            menuManager.openMenu(menuContainer);
        }
    });

    document.body.appendChild(toggleButton);

    return { menuContainer, toggleButton };
}
