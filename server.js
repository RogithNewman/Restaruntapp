// WhatsApp Daily Report Service
// This service sends daily sales reports via WhatsApp at 11:00 PM

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Set Puppeteer cache directory for Render.com
if (process.env.RENDER) {
    process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
}

const app = express();
app.use(express.json());

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// WhatsApp number (with country code, no +)
const WHATSAPP_NUMBER = '916379225692'; // India: 91 + 6379225692

// Store sales data
let salesData = [];
let currentQRCode = null;

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-software-rasterizer'
        ],
        // Use system Chrome if available, otherwise use bundled Chrome
        executablePath: process.env.CHROME_BIN || undefined
    }
});

// QR Code generation
client.on('qr', (qr) => {
    currentQRCode = qr; // Store QR code for API access
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  📱 WHATSAPP QR CODE - SCAN WITH YOUR PHONE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n');
    console.log('QR Code received, scan it with your WhatsApp:');
    console.log('\n');
    // Generate larger QR code for better visibility
    qrcode.generate(qr, { small: false });
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Instructions:');
    console.log('  1. Open WhatsApp on your phone');
    console.log('  2. Go to Settings → Linked Devices → Link a Device');
    console.log('  3. Point your camera at the QR code above');
    console.log('  🌐 OR open qr-display.html in your browser');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n');
});

// Client ready
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    console.log(`Daily reports will be sent to ${WHATSAPP_NUMBER} at 11:00 PM`);
});

// Client authentication
client.on('authenticated', () => {
    console.log('WhatsApp client authenticated!');
});

// Client authentication failure
client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
});

// Client disconnected
client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
});

// Initialize WhatsApp
client.initialize();

// API endpoint to receive sales data from frontend
app.post('/api/sales-data', async (req, res) => {
    try {
        salesData = req.body.salesHistory || [];
        console.log(`Received ${salesData.length} sales records`);
        res.json({ success: true, message: 'Sales data received' });
    } catch (error) {
        console.error('Error receiving sales data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API endpoint to manually send daily report
app.post('/api/send-report', async (req, res) => {
    try {
        const report = await generateDailyReport();
        await sendWhatsAppMessage(report);
        res.json({ success: true, message: 'Report sent successfully' });
    } catch (error) {
        console.error('Error sending report:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate daily report
async function generateDailyReport() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter today's sales
    const todaySales = salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= today && saleDate < tomorrow;
    });

    if (todaySales.length === 0) {
        return `📊 *Daily Sales Report*\n\n` +
               `📅 Date: ${today.toLocaleDateString('en-IN')}\n\n` +
               `No sales recorded today.`;
    }

    // Calculate totals
    const totalSales = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalOrders = todaySales.length;
    const avgOrderValue = totalSales / totalOrders;

    // Get popular items
    const itemCounts = {};
    todaySales.forEach(sale => {
        sale.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    const popularItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count})`)
        .join('\n');

    // Generate report message
    const restaurantName = salesData[0]?.restaurantName || 'Restaurant';
    
    let report = `📊 *Daily Sales Report*\n\n`;
    report += `🏪 ${restaurantName}\n`;
    report += `📅 Date: ${today.toLocaleDateString('en-IN')}\n\n`;
    report += `📈 *Summary:*\n`;
    report += `• Total Orders: ${totalOrders}\n`;
    report += `• Total Sales: ₹${totalSales.toFixed(2)}\n`;
    report += `• Average Order: ₹${avgOrderValue.toFixed(2)}\n\n`;

    if (popularItems) {
        report += `🔥 *Top 5 Items:*\n${popularItems}\n\n`;
    }

    report += `📋 *Order Details:*\n`;
    todaySales.forEach((sale, index) => {
        const time = new Date(sale.date).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        report += `${index + 1}. Order #${sale.orderId}\n`;
        report += `   Time: ${time}\n`;
        report += `   Items: ${sale.items.length}\n`;
        report += `   Total: ₹${sale.total.toFixed(2)}\n\n`;
    });

    report += `\n_Report generated automatically_`;

    return report;
}

// Send WhatsApp message
async function sendWhatsAppMessage(message) {
    try {
        const chatId = `${WHATSAPP_NUMBER}@c.us`;
        await client.sendMessage(chatId, message);
        console.log(`Report sent to ${WHATSAPP_NUMBER} at ${new Date().toLocaleString()}`);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}

// Schedule daily report at 11:00 PM
cron.schedule('0 23 * * *', async () => {
    console.log(`Scheduled report triggered at ${new Date().toLocaleString()}`);
    try {
        const report = await generateDailyReport();
        await sendWhatsAppMessage(report);
    } catch (error) {
        console.error('Error in scheduled report:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        whatsapp: client.info ? 'connected' : 'connecting',
        salesRecords: salesData.length 
    });
});

// QR Code endpoint for HTML display
app.get('/api/qr-code', (req, res) => {
    if (currentQRCode) {
        res.json({ qr: currentQRCode });
    } else {
        res.json({ qr: null, message: 'QR code not generated yet. Waiting for WhatsApp client...' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/sales-data`);
});
