// Admin CRUD operations and sales reports

const Admin = {
    editingItemId: null,
    currentView: 'reports',
    uploadedImageData: null,

    // Initialize admin page
    init() {
        this.setupFormHandler();
        this.showView('reports'); // Default view
        this.loadMenuItems();
        this.generateMonthlyReport();
        this.loadRestaurantName();
        this.updateCategoryDropdown();
    },

    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('admin-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('expanded');
        }
    },

    // Show specific view
    showView(viewName) {
        this.currentView = viewName;
        
        // Hide all views
        const views = document.querySelectorAll('.admin-view');
        views.forEach(view => view.classList.remove('active'));
        
        // Show selected view
        const targetView = document.getElementById(`view-${viewName}`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update sidebar active state
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Auto-expand sidebar on mobile when item clicked
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('admin-sidebar');
            if (sidebar && sidebar.classList.contains('expanded')) {
                setTimeout(() => {
                    sidebar.classList.remove('expanded');
                }, 300);
            }
        }
        
        // Load data for specific view
        if (viewName === 'menu-items') {
            this.loadMenuItems();
        } else if (viewName === 'reports') {
            this.generateMonthlyReport();
        } else if (viewName === 'settings') {
            this.loadRestaurantName();
        } else if (viewName === 'manage-menu') {
            this.updateCategoryDropdown();
        }
    },

    // Setup form handler
    setupFormHandler() {
        const form = document.getElementById('menu-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    },

    // Handle image upload
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImageData = e.target.result;
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            if (preview && previewImg) {
                previewImg.src = this.uploadedImageData;
                preview.style.display = 'block';
            }
            document.getElementById('item-image').value = this.uploadedImageData;
        };
        reader.readAsDataURL(file);
    },

    // Remove image preview
    removeImagePreview() {
        this.uploadedImageData = null;
        const preview = document.getElementById('image-preview');
        const fileInput = document.getElementById('item-image-upload');
        const imageInput = document.getElementById('item-image');
        
        if (preview) preview.style.display = 'none';
        if (fileInput) fileInput.value = '';
        if (imageInput) imageInput.value = '';
    },

    // Handle form submit
    handleFormSubmit() {
        const name = document.getElementById('item-name').value.trim();
        const price = parseFloat(document.getElementById('item-price').value);
        const category = document.getElementById('item-category').value.trim();
        const image = document.getElementById('item-image').value.trim() || this.uploadedImageData;

        if (!name || !price || !category) {
            alert('Please fill in all required fields');
            return;
        }

        if (!image) {
            alert('Please upload an image');
            return;
        }

        if (this.editingItemId) {
            this.updateMenuItem(this.editingItemId, { name, price, category, image });
        } else {
            this.addMenuItem({ name, price, category, image });
        }

        this.resetForm();
    },

    // Load menu items for admin
    loadMenuItems() {
        const items = Storage.getMenuItems();
        const container = document.getElementById('menu-items-container');
        if (!container) return;

        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">No menu items. Add items from Manage Menu.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card';
            card.innerHTML = `
                <div class="menu-item-info">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">` : ''}
                        <div>
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-details">
                                ₹${item.price.toFixed(2)} | ${item.category}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="menu-item-actions">
                    <button class="btn btn-edit" onclick="Admin.editMenuItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="Admin.deleteMenuItem(${item.id})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // Add new menu item
    addMenuItem(item) {
        const items = Storage.getMenuItems();
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItem = {
            id: newId,
            ...item
        };
        items.push(newItem);
        Storage.saveMenuItems(items);
        this.loadMenuItems();
        Menu.refresh(); // Refresh customer menu
        alert('Menu item added successfully!');
    },

    // Update existing menu item
    updateMenuItem(id, updatedItem) {
        const items = Storage.getMenuItems();
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { id, ...updatedItem };
            Storage.saveMenuItems(items);
            this.loadMenuItems();
            Menu.refresh(); // Refresh customer menu
            alert('Menu item updated successfully!');
        }
    },

    // Delete menu item
    deleteMenuItem(id) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }

        const items = Storage.getMenuItems();
        const filteredItems = items.filter(item => item.id !== id);
        Storage.saveMenuItems(filteredItems);
        this.loadMenuItems();
        Menu.refresh(); // Refresh customer menu
        alert('Menu item deleted successfully!');
    },

    // Edit menu item
    editMenuItem(id) {
        const items = Storage.getMenuItems();
        const item = items.find(i => i.id === id);
        if (!item) return;

        // Switch to manage menu view
        this.showView('manage-menu');

        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        const categorySelect = document.getElementById('item-category');
        if (categorySelect) {
            categorySelect.value = item.category || '';
        }
        
        // Handle image (could be base64 or URL)
        if (item.image) {
            if (item.image.startsWith('data:image')) {
                // Base64 image
                this.uploadedImageData = item.image;
                const preview = document.getElementById('image-preview');
                const previewImg = document.getElementById('preview-img');
                if (preview && previewImg) {
                    previewImg.src = item.image;
                    preview.style.display = 'block';
                }
            } else {
                // URL image
                document.getElementById('item-image').value = item.image;
            }
        }

        document.getElementById('edit-item-id').value = id;

        this.editingItemId = id;
        document.getElementById('submit-btn').textContent = 'Update Item';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll to form
        setTimeout(() => {
            document.querySelector('.menu-form-container').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    },

    // Cancel edit
    cancelEdit() {
        this.resetForm();
    },

    // Reset form
    resetForm() {
        document.getElementById('menu-form').reset();
        document.getElementById('edit-item-id').value = '';
        this.editingItemId = null;
        this.uploadedImageData = null;
        document.getElementById('submit-btn').textContent = 'Add Item';
        document.getElementById('cancel-btn').style.display = 'none';
        this.removeImagePreview();
    },
    
    // Load restaurant name
    loadRestaurantName() {
        const nameInput = document.getElementById('restaurant-name-input');
        if (nameInput) {
            nameInput.value = Storage.getRestaurantName();
        }
    },
    
    // Update restaurant name
    updateRestaurantName() {
        const nameInput = document.getElementById('restaurant-name-input');
        if (!nameInput) return;
        
        const newName = nameInput.value.trim();
        if (!newName) {
            alert('Please enter a shop name');
            return;
        }
        
        Storage.setRestaurantName(newName);
        App.restaurantName = newName;
        App.updateRestaurantNameDisplay();
        alert('Shop name updated successfully!');
    },
    
    // Update category dropdown with existing categories
    updateCategoryDropdown() {
        const items = Storage.getMenuItems();
        const defaultCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
        const existingCategories = new Set(items.map(item => item.category).filter(Boolean));
        
        // Combine default and existing categories
        const allCategories = [...defaultCategories];
        existingCategories.forEach(cat => {
            if (!allCategories.includes(cat)) {
                allCategories.push(cat);
            }
        });
        
        const select = document.getElementById('item-category');
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Category</option>';
            allCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
            if (currentValue) {
                select.value = currentValue;
            }
        }
    },

    // Switch between report types
    switchReportType(type) {
        const tabs = document.querySelectorAll('.report-tab');
        const monthlyControls = document.getElementById('monthly-report-controls');
        const dailyControls = document.getElementById('daily-report-controls');
        
        tabs.forEach(tab => {
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        if (type === 'monthly') {
            monthlyControls.style.display = 'flex';
            dailyControls.style.display = 'none';
            this.generateMonthlyReport();
        } else {
            monthlyControls.style.display = 'none';
            dailyControls.style.display = 'flex';
            this.generateDailyReport();
        }
    },

    // Generate monthly sales report
    generateMonthlyReport(monthInput = null) {
        const monthElement = monthInput || document.getElementById('report-month');
        const selectedMonth = monthElement ? monthElement.value : null;
        
        const salesHistory = Storage.getSalesHistory();
        const container = document.getElementById('sales-report');
        if (!container) return;

        if (salesHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No sales data available.</p>';
            return;
        }

        // Filter by month if selected
        let filteredSales = salesHistory;
        if (selectedMonth) {
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
                return saleMonth === selectedMonth;
            });
        } else {
            // Default to current month
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            if (monthElement) monthElement.value = currentMonth;
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
                return saleMonth === currentMonth;
            });
        }

        if (filteredSales.length === 0) {
            container.innerHTML = '<p class="empty-state">No sales data for selected month.</p>';
            return;
        }

        // Calculate totals
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = filteredSales.length;
        const averageOrder = totalSales / totalOrders;

        // Get popular items
        const itemCounts = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (itemCounts[item.name]) {
                    itemCounts[item.name] += item.quantity;
                } else {
                    itemCounts[item.name] = item.quantity;
                }
            });
        });

        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Pagination for order details
        const itemsPerPage = 25;
        const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
        const currentPage = 1;
        const paginatedSales = filteredSales.slice(0, itemsPerPage);

        // Render report
        container.innerHTML = `
            <div class="report-summary">
                <div class="report-card">
                    <div class="report-card-label">Total Sales</div>
                    <div class="report-card-value">₹${totalSales.toFixed(2)}</div>
                </div>
                <div class="report-card">
                    <div class="report-card-label">Total Orders</div>
                    <div class="report-card-value">${totalOrders}</div>
                </div>
                <div class="report-card">
                    <div class="report-card-label">Average Order</div>
                    <div class="report-card-value">₹${averageOrder.toFixed(2)}</div>
                </div>
            </div>

            <h3 style="margin-top: 20px;">Popular Items</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    ${popularItems.map(([name, qty]) => `
                        <tr>
                            <td>${name}</td>
                            <td>${qty}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3 style="margin-top: 30px;">Order Details</h3>
            <div id="order-details-container">
                <table class="report-table" id="order-details-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody id="order-details-body">
                        ${paginatedSales.map(sale => `
                            <tr>
                                <td>#${sale.orderId}</td>
                                <td>${new Date(sale.date).toLocaleDateString()}</td>
                                <td>${sale.items.length} item(s)</td>
                                <td>₹${sale.total.toFixed(2)}</td>
                                <td>${sale.paymentMethod || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${totalPages > 1 ? this.renderPagination('monthly', filteredSales, currentPage, totalPages, itemsPerPage) : ''}
        `;
        
        // Store sales data for pagination
        if (totalPages > 1) {
            container.dataset.salesData = JSON.stringify(filteredSales);
            container.dataset.reportType = 'monthly';
        }
    },

    // Generate daily sales report
    generateDailyReport(dateInput = null) {
        const dateElement = dateInput || document.getElementById('report-date');
        const selectedDate = dateElement ? dateElement.value : null;
        
        const salesHistory = Storage.getSalesHistory();
        const container = document.getElementById('sales-report');
        if (!container) return;

        if (salesHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No sales data available.</p>';
            return;
        }

        // Filter by date if selected
        let filteredSales = salesHistory;
        if (selectedDate) {
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleDateStr = saleDate.toISOString().split('T')[0];
                return saleDateStr === selectedDate;
            });
        } else {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            if (dateElement) dateElement.value = today;
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleDateStr = saleDate.toISOString().split('T')[0];
                return saleDateStr === today;
            });
        }

        if (filteredSales.length === 0) {
            container.innerHTML = '<p class="empty-state">No sales data for selected date.</p>';
            return;
        }

        // Calculate totals
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = filteredSales.length;
        const averageOrder = totalSales / totalOrders;

        // Get popular items
        const itemCounts = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (itemCounts[item.name]) {
                    itemCounts[item.name] += item.quantity;
                } else {
                    itemCounts[item.name] = item.quantity;
                }
            });
        });

        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Format date for display
        const displayDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }) : 'Today';

        // Pagination for order details
        const itemsPerPage = 25;
        const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
        const currentPage = 1;
        const paginatedSales = filteredSales.slice(0, itemsPerPage);

        // Render report
        container.innerHTML = `
            <div class="report-summary">
                <div class="report-card">
                    <div class="report-card-label">Date</div>
                    <div class="report-card-value" style="font-size: 18px;">${displayDate}</div>
                </div>
                <div class="report-card">
                    <div class="report-card-label">Total Sales</div>
                    <div class="report-card-value">₹${totalSales.toFixed(2)}</div>
                </div>
                <div class="report-card">
                    <div class="report-card-label">Total Orders</div>
                    <div class="report-card-value">${totalOrders}</div>
                </div>
                <div class="report-card">
                    <div class="report-card-label">Average Order</div>
                    <div class="report-card-value">₹${averageOrder.toFixed(2)}</div>
                </div>
            </div>

            <h3 style="margin-top: 20px;">Popular Items</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    ${popularItems.map(([name, qty]) => `
                        <tr>
                            <td>${name}</td>
                            <td>${qty}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3 style="margin-top: 30px;">Order Details</h3>
            <div id="order-details-container">
                <table class="report-table" id="order-details-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Time</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                        </tr>
                    </thead>
                    <tbody id="order-details-body">
                        ${paginatedSales.map(sale => `
                            <tr>
                                <td>#${sale.orderId}</td>
                                <td>${new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                                <td>${sale.items.length} item(s)</td>
                                <td>₹${sale.total.toFixed(2)}</td>
                                <td>${sale.paymentMethod || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${totalPages > 1 ? this.renderPagination('daily', filteredSales, currentPage, totalPages, itemsPerPage) : ''}
        `;
        
        // Store sales data for pagination
        if (totalPages > 1) {
            container.dataset.salesData = JSON.stringify(filteredSales);
            container.dataset.reportType = 'daily';
        }
    },

    // Export monthly report
    exportMonthlyReport() {
        const salesHistory = Storage.getSalesHistory();
        if (salesHistory.length === 0) {
            alert('No sales data to export');
            return;
        }

        const monthElement = document.getElementById('report-month');
        const selectedMonth = monthElement ? monthElement.value : null;

        let filteredSales = salesHistory;
        if (selectedMonth) {
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleMonth = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
                return saleMonth === selectedMonth;
            });
        }

        // Create CSV content
        const headers = ['Order ID', 'Date', 'Restaurant', 'Items', 'Total', 'Payment Method'];
        const rows = filteredSales.map(sale => [
            sale.orderId,
            new Date(sale.date).toLocaleString(),
            sale.restaurantName || 'Restaurant',
            sale.items.map(i => `${i.name} (x${i.quantity})`).join('; '),
            sale.total.toFixed(2),
            sale.paymentMethod || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-report-${selectedMonth || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Monthly report exported successfully!');
    },

    // Export daily report
    exportDailyReport() {
        const salesHistory = Storage.getSalesHistory();
        if (salesHistory.length === 0) {
            alert('No sales data to export');
            return;
        }

        const dateElement = document.getElementById('report-date');
        const selectedDate = dateElement ? dateElement.value : null;

        let filteredSales = salesHistory;
        if (selectedDate) {
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleDateStr = saleDate.toISOString().split('T')[0];
                return saleDateStr === selectedDate;
            });
        } else {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            filteredSales = salesHistory.filter(sale => {
                const saleDate = new Date(sale.date);
                const saleDateStr = saleDate.toISOString().split('T')[0];
                return saleDateStr === today;
            });
        }

        // Create CSV content
        const headers = ['Order ID', 'Date', 'Time', 'Restaurant', 'Items', 'Total', 'Payment Method'];
        const rows = filteredSales.map(sale => [
            sale.orderId,
            new Date(sale.date).toLocaleDateString(),
            new Date(sale.date).toLocaleTimeString(),
            sale.restaurantName || 'Restaurant',
            sale.items.map(i => `${i.name} (x${i.quantity})`).join('; '),
            sale.total.toFixed(2),
            sale.paymentMethod || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-report-${selectedDate || new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Daily report exported successfully!');
    },

    // Render pagination controls
    renderPagination(reportType, salesData, currentPage, totalPages, itemsPerPage) {
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        const pageButtons = [];
        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(`<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="Admin.goToPage(${i}, '${reportType}')">${i}</button>`);
        }

        return `
            <div class="pagination-container">
                <div class="pagination-info">
                    Showing ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, salesData.length)} of ${salesData.length} orders
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn" onclick="Admin.goToPage(${currentPage - 1}, '${reportType}')" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    ${startPage > 1 ? `<button class="pagination-btn" onclick="Admin.goToPage(1, '${reportType}')">1</button>${startPage > 2 ? '<span class="pagination-ellipsis">...</span>' : ''}` : ''}
                    ${pageButtons.join('')}
                    ${endPage < totalPages ? `${endPage < totalPages - 1 ? '<span class="pagination-ellipsis">...</span>' : ''}<button class="pagination-btn" onclick="Admin.goToPage(${totalPages}, '${reportType}')">${totalPages}</button>` : ''}
                    <button class="pagination-btn" onclick="Admin.goToPage(${currentPage + 1}, '${reportType}')" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </div>
            </div>
        `;
    },

    // Go to specific page
    goToPage(page, reportType) {
        const container = document.getElementById('sales-report');
        if (!container) return;

        const salesData = JSON.parse(container.dataset.salesData || '[]');
        const itemsPerPage = 25;
        const totalPages = Math.ceil(salesData.length / itemsPerPage);
        
        if (page < 1 || page > totalPages) return;

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedSales = salesData.slice(startIndex, endIndex);

        const tbody = document.getElementById('order-details-body');
        if (!tbody) return;

        // Update table body
        if (reportType === 'monthly') {
            tbody.innerHTML = paginatedSales.map(sale => `
                <tr>
                    <td>#${sale.orderId}</td>
                    <td>${new Date(sale.date).toLocaleDateString()}</td>
                    <td>${sale.items.length} item(s)</td>
                    <td>₹${sale.total.toFixed(2)}</td>
                    <td>${sale.paymentMethod || 'N/A'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = paginatedSales.map(sale => `
                <tr>
                    <td>#${sale.orderId}</td>
                    <td>${new Date(sale.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${sale.items.length} item(s)</td>
                    <td>₹${sale.total.toFixed(2)}</td>
                    <td>${sale.paymentMethod || 'N/A'}</td>
                </tr>
            `).join('');
        }

        // Update pagination controls
        const paginationContainer = container.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.outerHTML = this.renderPagination(reportType, salesData, page, totalPages, itemsPerPage);
        }

        // Scroll to top of table
        const table = document.getElementById('order-details-table');
        if (table) {
            table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Setup form handler when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Admin.setupFormHandler();
    });
} else {
    Admin.setupFormHandler();
}
