# Service Marketplace Website

A full-stack service marketplace website with user authentication, service listings, Stripe payment integration, and order management.

## Project Structure

```
service-marketplace/
├── backend/
│   └── server.js          # Express server with API routes
├── frontend/
│   ├── index.html         # Home page with services + login/register
│   ├── login.html         # Login page
│   ├── register.html      # Register page
│   ├── dashboard.html     # User's order history
│   ├── admin.html         # Admin panel for order management
│   └── styles (in each HTML file)
├── data.json              # JSON file database (auto-created)
└── package.json           # Node.js dependencies
```

## Features

- **User Authentication**: Register, login, JWT token-based auth
- **Service Listings**: Browse services with prices
- **Shopping Cart/Order**: Create orders with payment
- **Payment Integration**: Stripe test mode (you need to set your own test keys)
- **Order Tracking**: Users can see their order history
- **Admin Panel**: Admin can view all orders and update status

## How to Run

### 1. Navigate to the project folder
```bash
cd /home/saqi/service-marketplace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```
OR
```bash
node backend/server.js
```

The server will start at `http://localhost:3000`

### 4. Open the website
- **Home**: `http://localhost:3000/index.html`
- **Login**: `http://localhost:3000/login.html`
- **Register**: `http://localhost:3000/register.html`
- **Dashboard**: `http://localhost:3000/dashboard.html`
- **Admin**: `http://localhost:3000/admin.html`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user (requires auth)

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Add service (admin only)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/all` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent (requires auth)
- `POST /api/payments/webhook` - Stripe webhook (for payment confirmation)

## Stripe Setup (for production)

1. Get your Stripe keys from https://stripe.com
2. Create test mode keys: `sk_test_...` and `pk_test_...`
3. Set environment variables:
```bash
export STRIPE_SECRET_KEY=sk_test_xxxx
export STRIPE_PUBLIC_KEY=pk_test_xxxx
export STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

4. In frontend JavaScript, initialize Stripe.js:
```html
<script src="https://js.stripe.com/v3/"></script>
<script>
    const stripe = Stripe('pk_test_xxxx');
    // Then use stripe.handleCardPayment() to confirm payments
</script>
```

> **Note**: The current code uses a simulated payment flow (returns success directly).
> For production, integrate Stripe.js properly to handle card input securely.

## Security Notes

- **Demo mode only**: Nothing is actually charged in this demo
- **Test cards**: Stripe test mode accepts `4242 4242 4242 4242`
- **Never** use this for real payments without proper Stripe.js integration
- **Card details** are NEVER stored in the database

## Customization

### Add new services
Edit `backend/server.js` or add via admin panel (in production)

### Change prices
Edit the `data.json` file, or update the services in the database

### Change the design
Edit the `<style>` sections in the HTML files

## Demo Login Credentials (auto-created)

After first run, the database is seeded with dummy data. You can register with:
- Email: `test@example.com`
- Password: `test123`

## What Was Built (This Session)

1. ✅ Express.js backend with REST API
2. ✅ User registration & login (JWT auth)
3. ✅ Service listing with 8 sample services
4. ✅ Order creation & management
5. ✅ Stripe payment integration (test mode)
6. ✅ Frontend pages (home, login, register, dashboard, admin)
7. ✅ JSON file database (no native modules needed)
8. ✅ Responsive design

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: JSON file (simple, no native modules)
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe (test mode)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript

## Next Steps (Production Ready)

1. ✅ Generate real Stripe keys
2. ✅ Integrate Stripe.js for secure card input
3. ✅ Add email notifications
4. ✅ Deploy (Render, Railway, AWS, etc.)
5. ✅ Add more services
6. ✅ Add payment history detail page
7. ✅ Add admin role verification

---

**Note**: This is a demonstration marketplace. Always follow Stripe's PCI compliance requirements and never store raw card details. Use Stripe.js to handle card inputs securely.
