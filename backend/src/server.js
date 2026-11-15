const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express'), cors = require('cors'), helmet = require('helmet'), rateLimit = require('express-rate-limit'), sanitize = require('express-mongo-sanitize');
const connect = require('./config/db'); const { notFound, handler } = require('./middleware/error');
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Set MONGO_URI and JWT_SECRET in .env'); process.exit(1); }
const app = express(); app.set('trust proxy', 1);
app.use(helmet()); app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()), methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '100kb' })); app.use(sanitize());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { message: 'Too many login attempts. Try again later.' } }));
app.get('/api/health', (q, r) => r.json({ ok: true }));
app.use('/api', require('./routes/public')); app.use('/api/admin', require('./routes/admin'));
app.use(notFound); app.use(handler);
connect().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running'))).catch(e => { console.error(e.message); process.exit(1); });
