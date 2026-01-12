# WhatsApp Daily Reports Setup Guide

This guide will help you set up automatic daily sales reports via WhatsApp.

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **WhatsApp Web** - You need access to WhatsApp on your phone
3. **Your WhatsApp Number**: +91 6379225692

## Installation Steps

### 1. Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install:
- `express` - Web server
- `whatsapp-web.js` - WhatsApp Web API
- `qrcode-terminal` - QR code display
- `node-cron` - Scheduled tasks

### 2. Start the Server

Run the server:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

### 3. Connect WhatsApp

1. When you start the server, a QR code will appear in the terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices** → **Link a Device**
4. Scan the QR code shown in the terminal
5. Wait for "WhatsApp client is ready!" message

### 4. Configure WhatsApp Number

The server is already configured with your number: **6379225692**

If you need to change it, edit `server.js` and update:
```javascript
const WHATSAPP_NUMBER = '916379225692'; // Change this
```

**Note**: Use country code without + (India = 91, so 91 + your number)

### 5. Test the Setup

1. Open your restaurant website
2. Go to **Admin Panel** → **Settings** → **WhatsApp Reports**
3. Click **"Sync Sales Data"** to send current data to the server
4. Click **"Send Daily Report Now"** to test sending a report

## Automatic Daily Reports

The server is configured to automatically send daily reports at **11:00 PM (IST)** every day.

The report includes:
- Total orders for the day
- Total sales amount
- Average order value
- Top 5 popular items
- Detailed order list

## Server Configuration

### Default Port
The server runs on port **3000** by default.

To change it, set the `PORT` environment variable:
```bash
# Windows PowerShell
$env:PORT=4000; npm start

# Linux/Mac
PORT=4000 npm start
```

### API Endpoints

- `POST /api/sales-data` - Receive sales data from frontend
- `POST /api/send-report` - Manually send daily report
- `GET /health` - Check server status

## Troubleshooting

### QR Code Not Appearing
- Make sure you're running the server in a terminal that supports QR codes
- Try running `npm start` in a new terminal window

### WhatsApp Not Connecting
- Make sure your phone has internet connection
- Try unlinking and re-linking the device
- Delete `.wwebjs_auth` folder and restart server

### Reports Not Sending
- Check if the server is running: `GET http://localhost:3000/health`
- Verify WhatsApp connection status in server logs
- Make sure sales data is being synced from the frontend

### Server Won't Start
- Make sure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is already in use

## Running on a Server (Production)

For production deployment:

1. **Use PM2** (Process Manager):
```bash
npm install -g pm2
pm2 start server.js --name whatsapp-service
pm2 save
pm2 startup
```

2. **Or use a service** like:
   - Heroku
   - Railway
   - DigitalOcean
   - AWS EC2

3. **Update API URL** in `js/whatsapp-service.js`:
```javascript
apiUrl: 'https://your-server-url.com/api'
```

## Security Notes

- The WhatsApp session is stored locally in `.wwebjs_auth/`
- Never commit this folder to Git (already in .gitignore)
- Keep your server secure and private
- Don't share your WhatsApp session files

## Support

If you encounter any issues:
1. Check server logs for error messages
2. Verify all dependencies are installed
3. Make sure WhatsApp Web is working on your phone
4. Check network connectivity

---

**Note**: The server must be running 24/7 for automatic reports to work. Consider using a cloud server or a computer that's always on.
