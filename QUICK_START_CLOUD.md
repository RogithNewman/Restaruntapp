# Quick Start: Deploy WhatsApp Service to Cloud

## The Problem
- GitHub Pages only hosts static files (HTML, CSS, JS)
- Your WhatsApp service needs a Node.js server running 24/7
- When you close the terminal, the server stops

## The Solution
Host the backend on **Render.com** (free) so it runs 24/7 automatically!

## 5-Minute Setup

### Step 1: Deploy to Render.com

1. Go to **[https://render.com](https://render.com)** and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select repository: **`Restaruntapp`**
5. Configure:
   - **Name**: `restaurant-whatsapp` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deployment

### Step 2: Get Your URL

After deployment, Render gives you a URL like:
```
https://restaurant-whatsapp.onrender.com
```

**Copy this URL!**

### Step 3: Update Your Code

1. Open `js/whatsapp-service.js`
2. Find line 15:
   ```javascript
   return window.WHATSAPP_API_URL || 'https://your-app-name.onrender.com/api';
   ```
3. Replace `your-app-name.onrender.com` with your actual Render URL:
   ```javascript
   return window.WHATSAPP_API_URL || 'https://restaurant-whatsapp.onrender.com/api';
   ```
4. Save and push to GitHub:
   ```bash
   git add js/whatsapp-service.js
   git commit -m "Update API URL for cloud hosting"
   git push origin main
   ```

### Step 4: Connect WhatsApp

1. Open Render dashboard → Your service → **"Logs"** tab
2. You'll see a QR code in the logs
3. Open WhatsApp on your phone
4. Go to **Settings** → **Linked Devices** → **Link a Device**
5. Scan the QR code from Render logs
6. Wait for "WhatsApp client is ready!" message

### Step 5: Test It!

1. Open your GitHub Pages website
2. Go to **Admin Panel** → **Settings** → **WhatsApp Reports**
3. Click **"Sync Sales Data"** ✅
4. Click **"Send Daily Report Now"** ✅

## Done! 🎉

Your WhatsApp service now runs 24/7 in the cloud!

## Important Notes

### Free Tier Sleep Mode
- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- **Solution**: Use [UptimeRobot.com](https://uptimerobot.com) (free) to ping your service every 5 minutes

### Keep Service Awake (Optional)

1. Sign up at [UptimeRobot.com](https://uptimerobot.com)
2. Add monitor: `https://your-app.onrender.com/health`
3. Set interval: 5 minutes
4. Service stays awake 24/7!

## Troubleshooting

**Service not responding?**
- Check Render logs for errors
- Wait 30-60 seconds (service might be sleeping)
- Verify URL is correct in `whatsapp-service.js`

**QR code not showing?**
- Check Render logs
- Service might be starting up (wait 1-2 minutes)

**Reports not sending?**
- Verify WhatsApp is connected (check Render logs)
- Make sure you clicked "Sync Sales Data" first

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
