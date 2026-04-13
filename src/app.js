const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const versionMiddleware = require('./middleware/version');
const deprecationMiddleware = require('./middleware/deprecation');
const errorHandler = require('./middleware/errorHandler');

const v1Routes = require('./v1/routes');
const v2Routes = require('./v2/routes');

const app = express();

// ── Security & Utilities ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ── Version Detection ─────────────────────────────────────────────────────────
app.use(versionMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', deprecationMiddleware('v1', 'v2', '2025-12-31'), v1Routes);
app.use('/api/v2', v2Routes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    versions: {
      supported: ['v1', 'v2'],
      current: 'v2',
      deprecated: [{ version: 'v1', sunset: '2025-12-31' }]
    }
  });
});

// ── API Info ──────────────────────────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    name: 'API Versioning Demo',
    description: 'Démonstration de stratégies de versioning API',
    versions: {
      v1: { url: '/api/v1', status: 'deprecated', sunset: '2025-12-31' },
      v2: { url: '/api/v2', status: 'current' }
    },
    docs: '/api/docs'
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
