// Simple wrapper script to start the JavaScript version of the app
import { spawn } from 'child_process';
import process from 'process';

console.log('Starting Discord Bot in JavaScript mode...');

// Set environment variable
process.env.NODE_ENV = 'development';

// Start the server using node directly
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.kill('SIGTERM');
  process.exit(0);
});