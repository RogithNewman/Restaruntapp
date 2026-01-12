// Main application logic - cart, navigation, billing

const App = {
    currentScreen: 1, // 1: Items, 2: Verify, 3: Billing
    restaurantName: 'Restaurant',
    currentBill: null,

    // Initialize app
    init() {
        // Ensure storage is initialized first
        if (!Storage.getFromStorage('menuItems')) {
            Storage.initializeStorage();
        }
        
        this.restaurantName = Storage.getRestaurantName();
        this.updateRestaurantNameDisplay();
        this.showScreen(1);
        this.updateCartFooter();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            Menu.refresh();
        }, 100);
    },

    // Update restaurant name display
    updateRestaurantNameDisplay() {
        const elements = document.querySelectorAll('.restaurant-name');
        elements.forEach(el => {
            el.textContent = this.restaurantName;
        });
    },

    // Show specific screen
    showScreen(screenNumber) {
        this.currentScreen = screenNumber;
        const screens = document.querySelectorAll('.screen');
        screens.forEach((screen, index) => {
            if (index + 1 === screenNumber) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });

        if (screenNumber === 2) {
            this.displayVerifyScreen();
        } else if (screenNumber === 3) {
            this.displayBillingScreen();
        } else if (screenNumber === 4) {
            // Initialize admin panel
            if (typeof Admin !== 'undefined') {
                Admin.init();
            }
        }
    },

    // Navigate to screen
    navigateToScreen(screenNumber) {
        // Prevent navigation to verify/billing if cart is empty
        if (screenNumber === 2 || screenNumber === 3) {
            const cart = Storage.getCart();
            if (cart.length === 0 && screenNumber === 2) {
                alert('Your cart is empty! Add some items first.');
                return;
            }
            if (cart.length === 0 && screenNumber === 3) {
                alert('Your cart is empty! Add some items first.');
                return;
            }
        }
        this.showScreen(screenNumber);
    },

    // Add item to cart
    addToCart(itemId) {
        const menuItems = Storage.getMenuItems();
        const item = menuItems.find(mi => mi.id === itemId);
        if (!item) return;

        const cart = Storage.getCart();
        const existingItem = cart.find(ci => ci.itemId === itemId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            });
        }

        Storage.saveCart(cart);
        this.updateCartFooter();
        Menu.refresh();
    },

    // Update item quantity
    updateQuantity(itemId, change) {
        const cart = Storage.getCart();
        const item = cart.find(ci => ci.itemId === itemId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            Storage.saveCart(cart);
            this.updateCartFooter();
            Menu.refresh();
            
            // Update verify screen if visible
            if (this.currentScreen === 2) {
                this.displayVerifyScreen();
            }
        }
    },

    // Remove item from cart
    removeFromCart(itemId) {
        const cart = Storage.getCart();
        const filteredCart = cart.filter(ci => ci.itemId !== itemId);
        Storage.saveCart(filteredCart);
        this.updateCartFooter();
        Menu.refresh();
        
        if (this.currentScreen === 2) {
            this.displayVerifyScreen();
        }
    },

    // Calculate cart total
    calculateTotal() {
        const cart = Storage.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Get cart item count
    getCartItemCount() {
        const cart = Storage.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Update cart footer
    updateCartFooter() {
        const count = this.getCartItemCount();
        const total = this.calculateTotal();
        
        const footerCount = document.getElementById('cart-count');
        const footerTotal = document.getElementById('cart-total');
        const footerCountVerify = document.getElementById('cart-count-verify');
        const footerTotalVerify = document.getElementById('cart-total-verify');
        
        if (footerCount) footerCount.textContent = `${count} Item`;
        if (footerTotal) footerTotal.textContent = `₹${total.toFixed(2)}`;
        if (footerCountVerify) footerCountVerify.textContent = `${count} Item`;
        if (footerTotalVerify) footerTotalVerify.textContent = `₹${total.toFixed(2)}`;
    },

    // Display verify screen
    displayVerifyScreen() {
        const cart = Storage.getCart();
        const container = document.getElementById('verify-items');
        if (!container) return;

        container.innerHTML = '';

        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'verify-item';
            const fallbackImage = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80`;
            
            cartItem.innerHTML = `
                <div class="verify-item-image">
                    <img src="${item.image || fallbackImage}" alt="${item.name}" 
                         onerror="this.onerror=null; this.src='${fallbackImage}'">
                </div>
                <div class="verify-item-details">
                    <div class="verify-item-name">${item.name}</div>
                    <div class="verify-item-price">₹${item.price.toFixed(2)}</div>
                </div>
                <div class="verify-quantity-controls">
                    <button class="qty-btn minus" onclick="App.updateQuantity(${item.itemId}, -1)">−</button>
                    <span class="qty-value">${String(item.quantity).padStart(2, '0')}</span>
                    <button class="qty-btn plus" onclick="App.updateQuantity(${item.itemId}, 1)">+</button>
                </div>
            `;
            container.appendChild(cartItem);
        });

        this.updateCartFooter();
    },

    // Confirm order and generate bill
    confirmOrder() {
        const cart = Storage.getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const order = {
            orderId: Date.now(),
            date: new Date(),
            items: [...cart],
            total: this.calculateTotal(),
            restaurantName: this.restaurantName
        };

        this.currentBill = order;
        Storage.addToSalesHistory(order);
        this.showScreen(3);
    },

    // Display billing screen
    displayBillingScreen() {
        if (!this.currentBill) {
            const cart = Storage.getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                this.showScreen(1);
                return;
            }
            this.confirmOrder();
            return;
        }

        const bill = this.currentBill;
        const totalElement = document.getElementById('bill-total');
        const dateElement = document.getElementById('bill-date');

        if (totalElement) {
            totalElement.textContent = `₹${bill.total.toFixed(2)}`;
        }

        if (dateElement) {
            const date = new Date(bill.date);
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            dateElement.textContent = `Printed on ${date.toLocaleDateString('en-US', options)}`;
        }

        // Generate QR code with a small delay to ensure container is ready
        setTimeout(() => {
            this.generateQRCode(bill.total);
        }, 100);
    },

    // Generate QR code for UPI payment (lightweight solution)
    generateQRCode(amount) {
        const upiId = 'restaurant@paytm';
        const qrData = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Restaurant%20Bill`;
        
        const qrContainer = document.getElementById('qr-code');
        if (!qrContainer) return;

        qrContainer.innerHTML = '';
        
        // Use API-based QR code (fast and lightweight)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = 'UPI QR Code';
        img.style.width = '200px';
        img.style.height = '200px';
        img.onerror = () => this.showQRFallback(qrContainer, upiId, amount);
        qrContainer.appendChild(img);
    },

    // Show QR code fallback
    showQRFallback(container, upiId, amount) {
        container.innerHTML = `
            <div class="qr-placeholder">
                <p style="font-weight: 600; margin-bottom: 10px;">UPI Payment</p>
                <p>UPI ID: ${upiId}</p>
                <p>Amount: ₹${amount.toFixed(2)}</p>
                <p style="margin-top: 10px; font-size: 12px; color: #666;">Scan with UPI app</p>
            </div>
        `;
    },

    // Print bill with elegant design and animation
    printBill() {
        if (!this.currentBill) return;

        // Show printing animation
        this.showPrintAnimation();

        const bill = this.currentBill;
        const date = new Date(bill.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const formattedTime = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        setTimeout(() => {
            const printWindow = window.open('', '_blank');
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Bill - ${bill.restaurantName || 'Restaurant'}</title>
                    <meta charset="UTF-8">
                    <style>
                        @page {
                            margin: 0.5cm;
                            size: A4;
                        }
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 40px 30px;
                            background: #fff;
                            color: #1a1a1a;
                            line-height: 1.6;
                        }
                        .bill-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #4CAF50;
                        }
                        .restaurant-name {
                            font-size: 32px;
                            font-weight: 700;
                            color: #2c3e50;
                            margin-bottom: 8px;
                            letter-spacing: 1px;
                        }
                        .restaurant-tagline {
                            font-size: 14px;
                            color: #7f8c8d;
                            margin-bottom: 15px;
                        }
                        .bill-number {
                            font-size: 12px;
                            color: #95a5a6;
                            margin-top: 10px;
                        }
                        .bill-info {
                            display: flex;
                            justify-content: space-between;
                            margin: 25px 0;
                            padding: 15px;
                            background: #f8f9fa;
                            border-radius: 8px;
                        }
                        .info-section {
                            flex: 1;
                        }
                        .info-label {
                            font-size: 11px;
                            color: #7f8c8d;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 5px;
                        }
                        .info-value {
                            font-size: 14px;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        .items-section {
                            margin: 30px 0;
                        }
                        .section-title {
                            font-size: 16px;
                            font-weight: 600;
                            color: #2c3e50;
                            margin-bottom: 15px;
                            padding-bottom: 8px;
                            border-bottom: 2px solid #ecf0f1;
                        }
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        .items-table thead {
                            background: #4CAF50;
                            color: white;
                        }
                        .items-table th {
                            padding: 12px 10px;
                            text-align: left;
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .items-table td {
                            padding: 14px 10px;
                            border-bottom: 1px solid #ecf0f1;
                            font-size: 14px;
                        }
                        .items-table tbody tr:hover {
                            background: #f8f9fa;
                        }
                        .item-name {
                            font-weight: 500;
                            color: #2c3e50;
                        }
                        .item-qty, .item-price {
                            text-align: center;
                            color: #34495e;
                        }
                        .item-total {
                            text-align: right;
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        .total-section {
                            margin-top: 25px;
                            padding-top: 20px;
                            border-top: 2px solid #4CAF50;
                        }
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            font-size: 16px;
                        }
                        .total-label {
                            font-weight: 600;
                            color: #2c3e50;
                        }
                        .total-amount {
                            font-size: 24px;
                            font-weight: 700;
                            color: #4CAF50;
                        }
                        .payment-info {
                            margin-top: 20px;
                            padding: 15px;
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            border-radius: 4px;
                            font-size: 13px;
                            color: #856404;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #ecf0f1;
                            color: #7f8c8d;
                            font-size: 12px;
                        }
                        .footer-message {
                            font-size: 14px;
                            color: #4CAF50;
                            font-weight: 500;
                            margin-bottom: 8px;
                        }
                        .divider {
                            height: 1px;
                            background: linear-gradient(to right, transparent, #ecf0f1, transparent);
                            margin: 20px 0;
                        }
                        @media print {
                            body {
                                padding: 20px;
                            }
                            .bill-container {
                                box-shadow: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="bill-container">
                        <div class="header">
                            <div class="restaurant-name">RESTAURANT</div>
                            <div class="restaurant-tagline">Fine Dining Experience</div>
                            <div class="bill-number">Invoice #${bill.orderId}</div>
                        </div>

                        <div class="bill-info">
                            <div class="info-section">
                                <div class="info-label">Restaurant</div>
                                <div class="info-value">${bill.restaurantName || 'Restaurant'}</div>
                            </div>
                            <div class="info-section">
                                <div class="info-label">Date & Time</div>
                                <div class="info-value">${formattedDate}<br>${formattedTime}</div>
                            </div>
                        </div>

                        <div class="items-section">
                            <div class="section-title">Order Details</div>
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th class="item-qty">Qty</th>
                                        <th class="item-price">Price</th>
                                        <th class="item-total">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${bill.items.map(item => `
                                        <tr>
                                            <td class="item-name">${item.name}</td>
                                            <td class="item-qty">${item.quantity}</td>
                                            <td class="item-price">₹${item.price.toFixed(2)}</td>
                                            <td class="item-total">₹${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="total-section">
                            <div class="total-row">
                                <span class="total-label">Total Amount</span>
                                <span class="total-amount">₹${bill.total.toFixed(2)}</span>
                            </div>
                        </div>

                        ${bill.paymentMethod ? `
                            <div class="payment-info">
                                <strong>Payment Method:</strong> ${bill.paymentMethod}
                            </div>
                        ` : ''}

                        <div class="divider"></div>

                        <div class="footer">
                            <div class="footer-message">Thank you for dining with us!</div>
                            <p>We hope to see you again soon</p>
                            <p style="margin-top: 10px;">For feedback, please visit our website</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }, 500);
    },

    // Show printing animation
    showPrintAnimation() {
        const animation = document.createElement('div');
        animation.id = 'print-animation';
        animation.innerHTML = `
            <div class="print-animation-content">
                <div class="print-icon">🖨️</div>
                <div class="print-text">Printing Bill...</div>
                <div class="print-loader"></div>
            </div>
        `;
        document.body.appendChild(animation);

        setTimeout(() => {
            const animEl = document.getElementById('print-animation');
            if (animEl) {
                animEl.style.opacity = '0';
                setTimeout(() => animEl.remove(), 300);
            }
        }, 1500);
    },

    // Clear cart
    clearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
            Storage.saveCart([]);
            this.currentBill = null;
            this.updateCartFooter();
            Menu.refresh();
            this.showScreen(1);
            alert('Cart cleared successfully!');
        }
    },

    // Handle payment method selection
    selectPaymentMethod(method) {
        if (this.currentBill) {
            this.currentBill.paymentMethod = method;
            // Update the sales history with payment method
            const history = Storage.getSalesHistory();
            const orderIndex = history.findIndex(order => order.orderId === this.currentBill.orderId);
            if (orderIndex !== -1) {
                history[orderIndex].paymentMethod = method;
                Storage.saveToStorage('salesHistory', history);
            }
        }
        alert(`Payment method selected: ${method}`);
    }
};

// Initialize app when DOM is loaded (optimized)
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init.bind(App));
    } else {
        App.init();
    }
})();
