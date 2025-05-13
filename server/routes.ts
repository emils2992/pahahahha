import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupDiscordBot } from "./discord";

export async function registerRoutes(app: Express): Promise<Server> {
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
