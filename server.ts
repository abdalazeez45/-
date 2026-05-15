import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prismaPkg from '@prisma/client';
const { PrismaClient } = prismaPkg as any;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const prisma = new PrismaClient();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('orderCreated', (order) => {
    io.emit('newOrder', order);
  });

  socket.on('orderStatusChanged', (data) => {
    io.emit('orderUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27' as any,
});

app.use(express.json());

// Serve static files from the Angular app
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// --- API Routes ---

// Auth & Users API
app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user && user.password === password) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Delivery Zones API
app.get('/api/delivery-zones', async (req, res) => {
  const zones = await prisma.deliveryZone.findMany();
  res.json(zones);
});

app.post('/api/delivery-zones', async (req, res) => {
  const zone = await prisma.deliveryZone.create({ data: req.body });
  res.json(zone);
});

app.put('/api/delivery-zones/:id', async (req, res) => {
  const zone = await prisma.deliveryZone.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(zone);
});

app.delete('/api/delivery-zones/:id', async (req, res) => {
  await prisma.deliveryZone.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// Menu API
app.get('/api/menu', async (req, res) => {
  const categories = await prisma.category.findMany({ include: { items: true } });
  res.json(categories);
});

app.post('/api/menu/categories', async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.json(category);
});

app.put('/api/menu/categories/:id', async (req, res) => {
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(category);
});

app.delete('/api/menu/categories/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

app.post('/api/menu/categories/:id/items', async (req, res) => {
  const item = await prisma.menuItem.create({
    data: {
      ...req.body,
      categoryId: Number(req.params.id)
    }
  });
  res.json(item);
});

app.put('/api/menu/items/:id', async (req, res) => {
  const item = await prisma.menuItem.update({
    where: { id: Number(req.params.id) },
    data: req.body
  });
  res.json(item);
});

app.delete('/api/menu/items/:id', async (req, res) => {
  await prisma.menuItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// Orders API
app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true, user: true, driver: true } });

  const safeParse = <T,>(value: unknown): T | null => {
    try {
      if (typeof value !== 'string') return value as T;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  };

  const normalized = orders.map((o: any) => ({
    ...o,
    deliveryDetails: safeParse<any>(o.deliveryDetails) ?? o.deliveryDetails,
    financials: safeParse<any>(o.financials) ?? o.financials,
    items: Array.isArray(o.items) ? o.items : []
  }));

  res.json(normalized);
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, deliveryDetails, financials, user, ...rest } = req.body;

    // Create order and items
    const newOrder = await prisma.order.create({
      data: {
        status: rest.status || 'جديد',
        deliveryDetails: JSON.stringify(deliveryDetails),
        financials: JSON.stringify(financials),
        userId: user?.id || null,
        items: {
          create: items.map((item: any) => ({
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            status: item.status || 'pending'
          }))
        }
      },
      include: { items: true, user: true, driver: true }
    });

    io.emit('newOrder', newOrder);
    res.json(newOrder);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status: req.body.status },
      include: { items: true, user: true, driver: true }
    });
    io.emit('orderUpdate', order);
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/orders/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: {
        driverId: driverId,
        status: driverId ? 'بانتظار موافقة الموصل' : 'جديد'
      },
      include: { items: true, user: true, driver: true }
    });
    io.emit('orderUpdate', order);
    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Config
app.get('/api/config', (req, res) => {
  res.json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '' });
});

// All other routes serve the Angular app
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
