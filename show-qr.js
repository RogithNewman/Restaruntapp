// Helper script to display QR code in browser
// Run this if terminal QR code is not visible enough

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(express.static('public'));

let qrCodeData = null;

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Code generation - save for browser display
client.on('qr', async (qr) => {
    console.log('QR Code received!');
    qrCodeData = qr;
    
    // Also generate terminal QR
    const qrcodeTerminal = require('qrcode-terminal');
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  📱 WHATSAPP QR CODE - SCAN WITH YOUR PHONE');
    console.log('═══════════════════════════════════════════════════════\n');
    qrcodeTerminal.generate(qr, { small: false });
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  🌐 OR OPEN IN BROWSER: http://localhost:3001/qr');
    console.log('═══════════════════════════════════════════════════════\n');
});

// Serve QR code page
app.get('/qr', async (req, res) => {
    if (!qrCodeData) {
        return res.send(`
            <html>
                <head>
                    <title>WhatsApp QR Code</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background: #f0f0f0;
                            margin: 0;
                        }
                        .container {
                            text-align: center;
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        h1 { color: #25D366; }
                        .loading { color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>📱 WhatsApp QR Code</h1>
                        <p class="loading">Waiting for QR code...</p>
                        <p>Make sure the server is running and WhatsApp client is initializing.</p>
                        <script>
                            setTimeout(() => location.reload(), 2000);
                        </script>
                    </div>
                </body>
            </html>
        `);
    }

    try {
        const qrImage = await qrcode.toDataURL(qrCodeData);
        res.send(`
            <html>
                <head>
                    <title>WhatsApp QR Code</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                            margin: 0;
                            padding: 20px;
                        }
                        .container {
                            text-align: center;
                            background: white;
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                            max-width: 500px;
                        }
                        h1 { 
                            color: #25D366; 
                            margin-bottom: 10px;
                        }
                        .qr-code {
                            margin: 30px 0;
                            padding: 20px;
                            background: white;
                            border-radius: 10px;
                            display: inline-block;
                        }
                        .qr-code img {
                            max-width: 100%;
                            height: auto;
                            border: 5px solid #25D366;
                            border-radius: 10px;
                        }
                        .instructions {
                            text-align: left;
                            background: #f9f9f9;
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 20px;
                        }
                        .instructions ol {
                            margin: 10px 0;
                            padding-left: 20px;
                        }
                        .instructions li {
                            margin: 8px 0;
                            color: #333;
                        }
                        .status {
                            color: #25D366;
                            font-weight: bold;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>📱 WhatsApp QR Code</h1>
                        <p>Scan this QR code with your WhatsApp</p>
                        <div class="qr-code">
                            <img src="${qrImage}" alt="WhatsApp QR Code">
                        </div>
                        <div class="instructions">
                            <strong>How to scan:</strong>
                            <ol>
                                <li>Open WhatsApp on your phone</li>
                                <li>Tap <strong>⋮</strong> (three dots) → <strong>Settings</strong></li>
                                <li>Go to <strong>Linked Devices</strong></li>
                                <li>Tap <strong>Link a Device</strong></li>
                                <li>Point your camera at the QR code above</li>
                            </ol>
                        </div>
                        <p class="status">✅ QR Code Ready - Keep this page open</p>
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">
                            This page will automatically refresh if the QR code changes
                        </p>
                        <script>
                            // Auto-refresh every 5 seconds to check for new QR
                            setTimeout(() => location.reload(), 5000);
                        </script>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        res.send(`<h1>Error generating QR code: ${error.message}</h1>`);
    }
});

// Client ready
client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    console.log('✅ Daily reports will be sent to 916379225692 at 11:00 PM');
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
});

// Initialize
client.initialize();

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🌐 QR Code Viewer running on http://localhost:${PORT}/qr`);
    console.log('📱 Open this URL in your browser to see a larger QR code!\n');
});
