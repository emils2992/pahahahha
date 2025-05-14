import { createServer } from "http";
import { storage } from "./storage.js";
import { setupDiscordBot } from "./discord/index.js";

export async function registerRoutes(app) {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API status endpoint
  app.get('/api/status', (req, res) => {
    res.json({ status: 'operational', botStatus: 'online' });
  });
  
  // Setup Discord bot
  await setupDiscordBot();
  
  return httpServer;
}