const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const usersRouter = require('./routes/users');
const listingsRouter = require('./routes/listings');
const matchesRouter = require('./routes/matches');
const pricesRouter = require('./routes/prices');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3456;

// ---- Middleware -------------------------------------------------------------

// CORS — allow configured origin, default * for dev
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));

// Fix 8: security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting — 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Content-Type check for POST/PATCH/PUT
app.use((req, res, next) => {
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Content-Type must be application/json',
      });
    }
  }
  next();
});

// JSON body parser
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ---- Routes ----------------------------------------------------------------

app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/stats', statsRouter);

// ---- Health check ----------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Serve frontend static files -------------------------------------------
const staticDir = path.join(__dirname, '..');
app.use(express.static(staticDir));

// Root redirect to app.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app.html'));
});

// ---- 404 handler -----------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// ---- Error handling middleware ---------------------------------------------

// Fix 14: sanitize 500 error messages — never leak internals to clients
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// ---- Start -----------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[server] 再塑通 backend running on http://localhost:${PORT}`);
  console.log(`[server] API base: http://localhost:${PORT}/api`);
});

module.exports = app;
