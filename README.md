# Restaurant Ordering & Billing System with WhatsApp Integration

A modern, responsive restaurant ordering and billing system with **automatic WhatsApp daily reports**. Built with HTML, CSS, JavaScript, and Node.js for WhatsApp integration.

## Features

- **Menu Management**: Display menu items with categories (Breakfast, Lunch, Dinner, Snacks, Beverages)
- **Shopping Cart**: Add items to cart, update quantities, and verify orders
- **Billing System**: Generate bills with QR code for UPI payments
- **Print Bills**: Professional bill printing with elegant design
- **Admin Panel**: 
  - CRUD operations for menu items
  - Monthly and Daily sales reports
  - Export reports to CSV
  - Shop settings management
- **WhatsApp Integration**: 
  - Automatic daily sales reports sent to WhatsApp at 11:00 PM
  - Manual report sending
  - Real-time sales data synchronization
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All data stored in browser localStorage

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Responsive Design)
- Vanilla JavaScript
- localStorage for data persistence

**Backend (WhatsApp Integration):**
- Node.js
- Express.js
- WhatsApp Web.js
- Node-cron (Scheduled tasks)

## Getting Started

### Basic Setup (Frontend Only)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Restaurant-site
```

2. Open `index.html` in your web browser

3. No build process or dependencies required - it's a pure HTML/CSS/JS application!

### WhatsApp Reports Setup (Optional)

To enable automatic daily WhatsApp reports:

1. Install Node.js (v14 or higher)
2. Install dependencies:
```bash
npm install
```
3. Start the server:
```bash
npm start
```
4. Scan QR code with WhatsApp to connect
5. Reports will be sent automatically at 11:00 PM daily

See [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) for detailed instructions.

## Usage

### Customer View
- Browse menu items by category
- Add items to cart
- View and verify order
- Complete billing with payment options
- Print bills

### Admin Panel
- Click the ⚙️ icon in the header to access admin panel
- Manage menu items (Add, Edit, Delete)
- View monthly and daily sales reports
- Export reports to CSV
- Update shop/restaurant name

## Project Structure

```
Restaurant-site/
├── index.html              # Main application file
├── css/
│   └── style.css           # All styles (responsive)
├── js/
│   ├── storage.js          # localStorage utilities
│   ├── menu.js             # Menu display and filtering
│   ├── app.js              # Main app logic (cart, billing)
│   ├── admin.js            # Admin panel (CRUD, reports)
│   └── whatsapp-service.js # WhatsApp integration (frontend)
├── server.js               # WhatsApp service backend
├── package.json            # Node.js dependencies
├── WHATSAPP_SETUP.md       # WhatsApp setup guide
└── images/                 # Menu item images
```

## Features in Detail

### Menu Display
- Category filtering with pill-shaped buttons
- Real food images from Unsplash
- Add to cart functionality
- Quantity controls

### Billing
- QR code generation for UPI payments
- Multiple payment methods (Card, Cash, Other)
- Professional bill printing
- Clear cart functionality

### Reports
- Monthly sales reports with filtering
- Daily sales reports
- Popular items analysis
- Order details with pagination (25 items per page)
- CSV export functionality

### WhatsApp Integration ⭐ NEW
- **Automatic Daily Reports**: Sent automatically at 11:00 PM IST
- **Manual Report Sending**: Send reports anytime from admin panel
- **Real-time Data Sync**: Sales data automatically synced to server
- **Rich Report Format**: Includes total sales, orders, popular items, and order details
- **Easy Setup**: Simple QR code scanning to connect WhatsApp

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to fork this project and submit pull requests for any improvements.
