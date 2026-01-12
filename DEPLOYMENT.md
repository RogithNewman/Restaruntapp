# Cloud Deployment Guide - WhatsApp Service

This guide will help you deploy the WhatsApp service to a cloud platform so it runs 24/7, even when your computer is off.

## Why Cloud Hosting?

- **GitHub Pages** only hosts static files (HTML, CSS, JS) - it cannot run Node.js servers
- The WhatsApp service needs a **Node.js backend** running continuously
- Cloud hosting keeps your server running 24/7 automatically

## Recommended: Render.com (Free Tier)

Render.com offers a free tier that's perfect for this project.

### Step 1: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Verify your email

### Step 2: Deploy Backend Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository: `Restaruntapp`
4. Configure the service:
   - **Name**: `restaurant-whatsapp-service` (or any name you like)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or paid if you prefer)
5. Click **"Create Web Service"**

### Step 3: Get Your Service URL

After deployment (takes 2-3 minutes), Render will give you a URL like:
```
https://restaurant-whatsapp-service.onrender.com
```

**Copy this URL** - you'll need it in the next step!

### Step 4: Update Frontend to Use Cloud Backend

1. Open `js/whatsapp-service.js`
2. Find this line:
   ```javascript
   return window.WHATSAPP_API_URL || 'https://your-app-name.onrender.com/api';
   ```
3. Replace `your-app-name.onrender.com` with your actual Render URL:
   ```javascript
   return window.WHATSAPP_API_URL || 'https://restaurant-whatsapp-service.onrender.com/api';
   ```
4. Save and commit to GitHub:
   ```bash
   git add js/whatsapp-service.js
   git commit -m "Update WhatsApp API URL for cloud hosting"
   git push origin main
   ```

### Step 5: Connect WhatsApp

1. After deployment, open your Render service URL in browser: `https://your-app.onrender.com/health`
2. You should see: `{"status":"ok","whatsapp":"connecting",...}`
3. Check Render logs (click "Logs" tab in Render dashboard)
4. You'll see a QR code in the logs
5. Scan the QR code with WhatsApp (Settings → Linked Devices → Link a Device)
6. Wait for "WhatsApp client is ready!" in logs

### Step 6: Test the Service

1. Open your GitHub Pages website
2. Go to **Admin Panel** → **Settings** → **WhatsApp Reports**
3. Click **"Sync Sales Data"** - should work now!
4. Click **"Send Daily Report Now"** - should send to WhatsApp!

## Alternative: Railway.app (Free Tier)

Railway also offers free hosting:

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Get your URL from Railway dashboard
7. Update `whatsapp-service.js` with Railway URL

## Alternative: Heroku (Paid/Free Tier Available)

1. Go to [https://heroku.com](https://heroku.com)
2. Create account
3. Install Heroku CLI
4. Run:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```
5. Get URL and update frontend

## Environment Variables (Optional)

If you need to change the WhatsApp number or port:

1. In Render dashboard → Your service → **Environment**
2. Add variables:
   - `WHATSAPP_NUMBER`: `916379225692` (your number)
   - `PORT`: `10000` (Render uses this)

## Important Notes

### Free Tier Limitations

- **Render Free**: Service sleeps after 15 minutes of inactivity, wakes up on first request (may take 30-60 seconds)
- **Railway Free**: Limited hours per month
- **Solution**: Use a "ping service" like [UptimeRobot](https://uptimerobot.com) to keep service awake

### Keeping Service Awake (Optional)

1. Sign up at [UptimeRobot.com](https://uptimerobot.com) (free)
2. Add monitor for your Render URL: `https://your-app.onrender.com/health`
3. Set interval to 5 minutes
4. This keeps your service awake 24/7

### Troubleshooting

**Service not responding:**
- Check Render logs for errors
- Verify WhatsApp is connected (check logs)
- Make sure frontend URL is updated correctly

**QR Code not showing:**
- Check Render logs
- Service may be sleeping - wait 30-60 seconds after first request

**Reports not sending:**
- Verify WhatsApp connection in logs
- Check that sales data is being synced
- Verify cron job is running (check logs at 11 PM IST)

## Summary

1. ✅ Deploy backend to Render.com (free)
2. ✅ Get your service URL
3. ✅ Update `js/whatsapp-service.js` with the URL
4. ✅ Push to GitHub
5. ✅ Connect WhatsApp via QR code in Render logs
6. ✅ Test from your GitHub Pages site

Your WhatsApp service will now run 24/7 in the cloud! 🚀
