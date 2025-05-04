export const menuManager = {
    activeMenu: null,
    
    openMenu: function(menuContainer) {
        // Close currently active menu if it exists
        if (this.activeMenu && this.activeMenu !== menuContainer) {
            this.activeMenu.style.display = 'none';
        }
        
        // Set and show the new active menu
        this.activeMenu = menuContainer;
        this.activeMenu.style.display = 'block';

        // play menu open sound
        const audio = new Audio('menuOpen.mp3'); // Adjust the path to your sound file
        audio.volume = 0.5; // Set volume to 50%
        audio.play();
        audio.loop = false; // Play sound once
    },
    
    closeMenu: function() {
        if (this.activeMenu) {
            this.activeMenu.style.display = 'none';
            this.activeMenu = null;
        }
    },
    
    isMenuActive: function(menuContainer) {
        return this.activeMenu === menuContainer;
    }
};