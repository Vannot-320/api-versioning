const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 API Info    : http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🟡 API v1      : http://localhost:${PORT}/api/v1  [DEPRECATED]`);
  console.log(`🟢 API v2      : http://localhost:${PORT}/api/v2  [CURRENT]`);
});
