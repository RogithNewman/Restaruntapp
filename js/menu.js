// Menu data management and display

const Menu = {
    currentCategory: 'All',
    categories: [],

    // Load menu from storage
    loadMenu() {
        return Storage.getMenuItems();
    },

    // Get all unique categories
    getCategories() {
        const items = this.loadMenu();
        const cats = ['All', ...new Set(items.map(item => item.category))];
        this.categories = cats;
        return cats;
    },

    // Display menu items
    displayMenu(category = 'All') {
        this.currentCategory = category;
        const items = this.loadMenu();
        
        // Check if items exist
        if (!items || items.length === 0) {
            const menuContainer = document.getElementById('menu-items');
            if (menuContainer) {
                menuContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No menu items available. Add items from Admin Panel.</p>';
            }
            return;
        }
        
        const filteredItems = category === 'All' 
            ? items 
            : items.filter(item => item.category === category);

        const menuContainer = document.getElementById('menu-items');
        if (!menuContainer) {
            console.error('Menu container not found');
            return;
        }

        menuContainer.innerHTML = '';

        filteredItems.forEach(item => {
            const cart = Storage.getCart();
            const cartItem = cart.find(ci => ci.itemId === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            // Fallback to food image from Unsplash if image fails
            const fallbackImage = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80`;
            
            menuItem.innerHTML = `
                <div class="menu-item-image-wrapper">
                    <div class="menu-item-image">
                        <img src="${item.image || fallbackImage}" alt="${item.name}" 
                             onerror="this.onerror=null; this.src='${fallbackImage}'">
                    </div>
                </div>
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                ${quantity > 0 
                    ? `<div class="quantity-controls">
                        <button class="qty-btn minus" onclick="App.updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-value">${String(quantity).padStart(2, '0')}</span>
                        <button class="qty-btn plus" onclick="App.updateQuantity(${item.id}, 1)">+</button>
                       </div>`
                    : `<button class="add-btn" onclick="App.addToCart(${item.id})">+ Add</button>`
                }
            `;
            menuContainer.appendChild(menuItem);
        });
    },

    // Filter menu by category
    filterByCategory(category) {
        this.currentCategory = category || 'All';
        this.displayMenu(this.currentCategory);
        this.updateCategoryDropdown(this.currentCategory);
    },

    // Update category button states
    updateCategoryButtons(activeCategory) {
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
            if (btn.dataset.category === activeCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Render category buttons
    renderCategoryButtons() {
        const categories = this.getCategories();
        const container = document.getElementById('category-filters');
        if (!container) return;

        container.innerHTML = '';
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category;
            btn.textContent = category;
            if (category === 'All') {
                btn.classList.add('active');
            }
            btn.onclick = () => this.filterByCategory(category);
            container.appendChild(btn);
        });
    },

    // Refresh menu display
    refresh() {
        this.renderCategoryButtons();
        this.displayMenu(this.currentCategory);
        this.updateCategoryButtons(this.currentCategory);
    }
};
