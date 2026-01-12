// localStorage utilities for restaurant app

const Storage = {
    // Save data to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    },

    // Retrieve data from localStorage
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    },

    // Initialize storage with default data structure
    initializeStorage() {
        // Initialize menu items if not exists
        if (!this.getFromStorage('menuItems')) {
            const defaultMenu = [
                { id: 1, name: 'Idly', price: 5.00, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=500&fit=crop&q=90' },
                { id: 2, name: 'Dosai', price: 8.00, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop&q=90' },
                { id: 3, name: 'Poori', price: 6.00, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&h=500&fit=crop&q=90' },
                { id: 4, name: 'Vada', price: 4.00, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=500&fit=crop&q=90' }
            ];
            this.saveToStorage('menuItems', defaultMenu);
        }

        // Initialize cart if not exists
        if (!this.getFromStorage('currentCart')) {
            this.saveToStorage('currentCart', []);
        }

        // Initialize sales history if not exists
        if (!this.getFromStorage('salesHistory')) {
            this.saveToStorage('salesHistory', []);
        }

        // Initialize restaurant name if not exists
        if (!this.getFromStorage('restaurantName')) {
            this.saveToStorage('restaurantName', 'Restaurant');
        }
    },

    // Get menu items
    getMenuItems() {
        return this.getFromStorage('menuItems', []);
    },

    // Save menu items
    saveMenuItems(items) {
        return this.saveToStorage('menuItems', items);
    },

    // Get current cart
    getCart() {
        return this.getFromStorage('currentCart', []);
    },

    // Save cart
    saveCart(cart) {
        return this.saveToStorage('currentCart', cart);
    },

    // Get sales history
    getSalesHistory() {
        return this.getFromStorage('salesHistory', []);
    },

    // Add to sales history
    addToSalesHistory(order) {
        const history = this.getSalesHistory();
        history.push(order);
        return this.saveToStorage('salesHistory', history);
    },

    // Get restaurant name
    getRestaurantName() {
        return this.getFromStorage('restaurantName', 'Restaurant');
    },

    // Set restaurant name
    setRestaurantName(name) {
        return this.saveToStorage('restaurantName', name);
    }
};

// Initialize storage on load (optimized)
(function() {
    if (typeof window !== 'undefined' && document.readyState !== 'loading') {
        Storage.initializeStorage();
    } else if (typeof window !== 'undefined') {
        document.addEventListener('DOMContentLoaded', Storage.initializeStorage.bind(Storage));
    }
})();
