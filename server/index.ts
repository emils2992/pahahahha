import express from "express";
import { createServer } from "http";

// Basic Express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Main function
async function main() {
  try {
    // Create HTTP server
    const port = process.env.PORT || 5000;
    const server = createServer(app);
    
    // Simple status endpoint
    app.get('/api/status', (req, res) => {
      res.json({ 
        status: 'operational',
        message: 'Discord bot server is running' 
      });
    });
    
    // Handle root path
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head>
            <title>Football Manager Discord Bot</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              .status { padding: 10px; background: #e8f5e9; border-radius: 4px; margin: 20px 0; }
              code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <h1>Football Manager Discord Bot</h1>
            <div class="status">
              <h3>✅ Server Status: Online</h3>
              <p>Bot is ready to receive commands.</p>
            </div>
            <p>This is a simple web interface for the Discord bot. The actual bot functionality runs through Discord commands.</p>
            <p>Make sure to set the <code>DISCORD_BOT_TOKEN</code> environment variable in your environment.</p>
          </body>
        </html>
      `);
    });
    
    // Start server
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Bot web interface available at http://localhost:${port}`);
      
      // Log information about the bot status
      console.log("IMPORTANT: To use the Discord bot, make sure to set the DISCORD_BOT_TOKEN environment variable.");
      console.log("This simple server doesn't include the bot functionality yet - just a placeholder for the UI.");
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
}

// Start the application
main().catch(err => {
  console.error("Application error:", err);
});