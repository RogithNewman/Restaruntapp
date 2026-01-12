// WhatsApp Service Integration for Frontend
// This file handles sending sales data to the backend service

const WhatsAppService = {
    // Auto-detect API URL based on environment
    // For local development: http://localhost:3000/api
    // For production: Use your cloud server URL (e.g., https://your-app.onrender.com/api)
    get apiUrl() {
        // Check if we're on localhost (development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // For production, use environment variable or default to your cloud URL
        // Replace 'your-app-name' with your actual Render/Railway app name
        return window.WHATSAPP_API_URL || 'https://your-app-name.onrender.com/api';
    },
    
    // Send sales data to backend
    async syncSalesData() {
        try {
            const salesHistory = Storage.getSalesHistory();
            const restaurantName = Storage.getRestaurantName();
            
            const apiUrl = this.apiUrl; // Get API URL once
            const response = await fetch(`${apiUrl}/sales-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    salesHistory: salesHistory,
                    restaurantName: restaurantName
                })
            });

            const result = await response.json();
            if (result.success) {
                console.log('Sales data synced successfully');
                return true;
            } else {
                console.error('Failed to sync sales data:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error syncing sales data:', error);
            // Don't show error to user if server is not running
            return false;
        }
    },

    // Manually send daily report
    async sendDailyReport() {
        try {
            // First sync the data
            await this.syncSalesData();
            
            const apiUrl = this.apiUrl; // Get API URL once
            const response = await fetch(`${apiUrl}/send-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            if (result.success) {
                alert('Daily report sent successfully to WhatsApp!');
                return true;
            } else {
                alert('Failed to send report: ' + result.error);
                return false;
            }
        } catch (error) {
            console.error('Error sending report:', error);
            alert('Error: Could not connect to WhatsApp service. Make sure the server is running.');
            return false;
        }
    },

    // Check if service is available
    async checkService() {
        try {
            const apiUrl = this.apiUrl; // Get API URL once
            const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
            const result = await response.json();
            return result.status === 'ok';
        } catch (error) {
            return false;
        }
    },

    // Auto-sync after each order
    autoSync() {
        // Sync data after a short delay to ensure order is saved
        setTimeout(() => {
            this.syncSalesData();
        }, 1000);
    }
};

// Auto-sync sales data when a new order is placed
if (typeof Storage !== 'undefined') {
    // Override the addToSalesHistory to auto-sync
    const originalAddToSalesHistory = Storage.addToSalesHistory;
    Storage.addToSalesHistory = function(order) {
        const result = originalAddToSalesHistory.call(this, order);
        if (typeof WhatsAppService !== 'undefined') {
            WhatsAppService.autoSync();
        }
        return result;
    };
}
