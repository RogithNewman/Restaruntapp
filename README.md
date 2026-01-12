# Restaurant Ordering & Billing System

A modern, responsive restaurant ordering and billing system built with HTML, CSS, and JavaScript.

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
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All data stored in browser localStorage

## Tech Stack

- HTML5
- CSS3 (Responsive Design)
- Vanilla JavaScript
- localStorage for data persistence

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Restaurant-site
```

2. Open `index.html` in your web browser

3. No build process or dependencies required - it's a pure HTML/CSS/JS application!

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
├── index.html          # Main application file
├── css/
│   └── style.css       # All styles (responsive)
├── js/
│   ├── storage.js      # localStorage utilities
│   ├── menu.js         # Menu display and filtering
│   ├── app.js          # Main app logic (cart, billing)
│   └── admin.js        # Admin panel (CRUD, reports)
└── images/             # Menu item images
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

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to fork this project and submit pull requests for any improvements.
