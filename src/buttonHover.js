/**
 * Applies hover and click effects to a button
 * @param {HTMLButtonElement} button - The button to apply effects to
 * @param {Object} options - Optional configuration options
 * @param {number} options.hoverBrightness - Brightness percentage on hover (default: 85)
 * @param {number} options.clickBrightness - Brightness percentage on click (default: 70)
 * @param {number} options.hoverScale - Scale factor on hover (default: 1.05)
 * @param {number} options.clickScale - Scale factor on click (default: 0.95)
 */
export function applyHoverEffects(button, options = {}) {
    // Default options
    const config = {
        hoverBrightness: 115,
        clickBrightness: 70,
        hoverScale: 1.05,
        clickScale: 0.95,
        ...options
    };
    
    // Add transition for smooth effects
    button.style.transition = 'all 0.15s ease';
    
    // Hover effect (mouse enters the button)
    button.addEventListener('mouseenter', () => {
        // Darken the button color
        button.style.filter = `brightness(${config.hoverBrightness}%)`;
        // Add a subtle shadow
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        // Scale the button slightly
        button.style.transform = `scale(${config.hoverScale})`;
    });

    // Hover off (mouse leaves the button)
    button.addEventListener('mouseleave', () => {
        // Reset to normal state
        button.style.filter = 'brightness(100%)';
        button.style.boxShadow = 'none';
        button.style.transform = 'scale(1)';
    });

    // Click effect (mouse down on button)
    button.addEventListener('mousedown', () => {
        // Darken more and "press" the button
        button.style.filter = `brightness(${config.clickBrightness}%)`;
        button.style.transform = `scale(${config.clickScale})`;
        button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    });

    // Release effect (mouse up on button)
    button.addEventListener('mouseup', () => {
        // Return to hover state if still hovering
        button.style.filter = `brightness(${config.hoverBrightness}%)`;
        button.style.transform = `scale(${config.hoverScale})`;
        button.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
    });
    
    // Prevent focus outline (optional)
    button.style.outline = 'none';
    
    // Handle focus state for accessibility (keyboard navigation)
    button.addEventListener('focus', () => {
        button.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.5)';
    });
    
    button.addEventListener('blur', () => {
        button.style.boxShadow = 'none';
    });
}

/**
 * Applies hover and click effects to multiple buttons
 * @param {HTMLButtonElement[]} buttons - Array of buttons to apply effects to
 * @param {Object} options - Optional configuration options
 */
export function applyButtonEffectsToAll(buttons, options = {}) {
    buttons.forEach(button => applyHoverEffects(button, options));
}