const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Simple JSON file database
const DATA_FILE = path.join(__dirname, 'data.json');
let data = { users: [], services: [], orders: [] };

function loadData() {
    try {
        const fs = require('fs');
        if (fs.existsSync(DATA_FILE)) {
            data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (err) {
        data = { users: [], services: [], orders: [] };
    }
}

function saveData() {
    const fs = require('fs');
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Initialize database
loadData();
if (data.users.length === 0) {
    data.services = [
        { id: 1, title: 'Content Writing', description: 'Professional content writing for blogs, articles, and websites', price: 150 },
        { id: 2, title: 'SEO Optimization', description: 'Search engine optimization services to boost your website ranking', price: 250 },
        { id: 3, title: 'Graphic Design', description: 'Professional graphic design services for logos, banners, and social media', price: 300 },
        { id: 4, title: 'Website Development', description: 'Custom website development with modern technologies', price: 500 },
        { id: 5, title: 'Social Media Management', description: 'Complete social media management and content scheduling', price: 200 },
        { id: 6, title: 'Video Editing', description: 'Professional video editing for YouTube and social media content', price: 350 },
        { id: 7, title: 'Proofreading', description: 'Professional proofreading and editing services for academic and business documents', price: 100 },
        { id: 8, title: 'Logo Design', description: 'Unique logo design for your brand and business', price: 180 },
    ];
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper: Generate JWT token
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper: Require auth
function auth(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// ===== AUTH ROUTES =====

// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Simple validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user exists
        const existing = data.users.find(u => u.email === email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            created_at: new Date().toISOString()
        };

        data.users.push(user);
        saveData();

        // Create user object (without password)
        const userPublic = { id: user.id, name: user.name, email: user.email };

        res.status(201).json({
            message: 'User registered successfully',
            token: generateToken(userPublic)
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const user = data.users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.id, email: user.email });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
app.get('/api/me', auth, (req, res) => {
    const user = data.users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user.id, name: user.name, email: user.email });
});

// ===== SERVICES =====

// Get all services
app.get('/api/services', (req, res) => {
    res.json(data.services);
});

// Get single service
app.get('/api/services/:id', (req, res) => {
    const service = data.services.find(s => s.id === parseInt(req.params.id));
    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
});

// Add service (admin)
app.post('/api/services', auth, (req, res) => {
    const { title, description, price } = req.body;

    // Simple validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
    }
    if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return res.status(400).json({ message: 'Valid price required' });
    }

    const service = {
        id: Date.now().toString(),
        title,
        description,
        price: parseFloat(price),
        created_at: new Date().toISOString()
    };

    data.services.push(service);
    saveData();

    res.status(201).json({
        message: 'Service added successfully',
        id: service.id
    });
});

// ===== ORDERS =====

// Create order
app.post('/api/orders', auth, (req, res) => {
    const { service_id, amount } = req.body;

    // Simple validation
    if (!service_id || isNaN(parseInt(service_id))) {
        return res.status(400).json({ message: 'Valid service ID required' });
    }
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Valid amount required' });
    }

    try {
        // Verify service exists
        const service = data.services.find(s => s.id === parseInt(service_id));
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Create order
        const order = {
            id: Date.now().toString(),
            user_id: req.user.id,
            service_id: parseInt(service_id),
            amount: parseFloat(amount),
            status: 'pending',
            created_at: new Date().toISOString()
        };

        data.orders.push(order);
        saveData();

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user orders
app.get('/api/orders', auth, (req, res) => {
    const orders = data.orders
        .filter(o => o.user_id === req.user.id)
        .map(o => ({
            id: o.id,
            service_id: o.service_id,
            amount: o.amount,
            status: o.status,
            created_at: o.created_at,
            service_title: data.services.find(s => s.id === o.service_id)?.title || 'Unknown'
        }))
        .reverse();

    res.json(orders);
});

// Get all orders (admin)
app.get('/api/orders/all', auth, (req, res) => {
    const orders = data.orders.map(o => ({
        id: o.id,
        user_id: o.user_id,
        service_id: o.service_id,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        service_title: data.services.find(s => s.id === o.service_id)?.title || 'Unknown',
        user_name: data.users.find(u => u.id === o.user_id)?.name || 'Unknown'
    })).reverse();

    res.json(orders);
});

// Change order status (admin)
app.put('/api/orders/:id/status', auth, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = data.orders.find(o => o.id === id);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    saveData();

    res.json({ message: 'Order updated successfully', status });
});

// ===== STRIPE PAYMENT =====

// Initialize Stripe (use test mode keys)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51ExampleStripePrivateKey');

app.post('/api/payments/create-intent', auth, async (req, res) => {
    try {
        const { amount } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                userId: req.user.id,
                serviceId: req.body.service_id
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (err) {
        console.error('Stripe intent error:', err);
        res.status(500).json({ message: 'Payment intent error', error: err.message });
    }
});

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_example';

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Update order status to completed
        const order = data.orders.find(o => o.stripe_payment_intent === paymentIntent.id);
        if (order) {
            order.status = 'completed';
            saveData();
        }
        console.log(`Payment succeeded for order: ${paymentIntent.metadata?.userId}`);
    } else {
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
