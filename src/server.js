const http = require('http');
const app = require('./app');
const PORT = process.env.PORT || 3000;

// For Vercel serverless, export the app directly
// For local development, start the server
if (require.main === module) {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

