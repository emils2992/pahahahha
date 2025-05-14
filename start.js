import express from "express";
import { createServer } from "http";
import { setupDiscordBot } from "./server/discord/index.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'operational', botStatus: 'online' });
});

// Main function
async function main() {
  const port = process.env.PORT || 3000;
  const server = createServer(app);
  
  // Start Discord bot
  await setupDiscordBot();
  
  // Start server
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

// Start the application
main().catch(err => {
  console.error("Error starting application:", err);
});