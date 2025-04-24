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