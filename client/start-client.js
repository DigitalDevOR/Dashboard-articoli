#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Bet Master League Client...');
console.log('📍 Client will be available on port 5173 (mapped to external port 80)');
console.log('🔗 API Server: http://localhost:5000');

// Change to client directory
process.chdir(path.join(__dirname));

// Start Vite dev server
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: 'inherit',
  shell: true,
});

viteProcess.on('error', (error) => {
  console.error('Failed to start client:', error);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  console.log(`Client process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down client...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down client...');
  viteProcess.kill('SIGTERM');
});