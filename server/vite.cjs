// Simple helper functions for the Express server
const express = require('express');
const fs = require('fs');
const path = require('path');

// Logging function
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Simplified setup function without Vite
function setupServer(app) {
  // Static file server for public directory if it exists
  const publicPath = path.join(__dirname, 'public');
  
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    log('Serving static files from ' + publicPath);
  }
  
  // Serve simple html for routes without API prefix
  app.use('*', (req, res, next) => {
    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Football Manager Discord Bot</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .status { padding: 10px; background: #e8f5e9; border-radius: 4px; margin: 20px 0; }
          .offline { background: #ffebee; }
          code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Football Manager Discord Bot</h1>
        <div class="status">
          <h3>Discord Bot Status</h3>
          <p>Bot durumunu kontrol etmek için /api/status adresini ziyaret edin.</p>
        </div>
        <p>Bu basit web arayüzü, Discord bot'unuzun çalışma durumunu izlemek içindir. Gerçek bot işlevselliği Discord komutları aracılığıyla çalışır.</p>
        <p>Mevcut komutlar:</p>
        <ul>
          <li><code>.takim</code> - Takım seçimi yapmak için</li>
          <li><code>.karar</code> - Teknik direktör kararları vermek için</li>
          <li><code>.taktik</code> - Taktik ayarları için</li>
          <li><code>.basin</code> - Basın toplantısı düzenlemek için</li>
          <li><code>.durum</code> - Teknik direktör durumunu görmek için</li>
          <li><code>.h</code> - Yardım menüsü için</li>
        </ul>
      </body>
      </html>
    `;
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlContent);
  });
}

// Serve static files
function serveStatic(app, directory = 'public') {
  const staticPath = path.join(__dirname, directory);
  
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    log(`Serving static files from ${staticPath}`);
  } else {
    log(`Static directory ${staticPath} does not exist`);
  }
}

// Export functions
module.exports = {
  log,
  setupServer,
  serveStatic
};