#!/usr/bin/env node

import { spawn } from 'child_process';
import { getPort } from 'get-port-please';

async function startDevServers() {
  try {
    // Get available ports
    const frontendPort = await getPort({ port: 3000, portRange: [3000, 3010] });
    const backendPort = await getPort({ port: 3001, portRange: [3001, 3011] });
    
    console.log(`🚀 Starting frontend on port ${frontendPort}`);
    console.log(`🔥 Starting backend on port ${backendPort}`);
    
    // Start both servers with concurrently
    const devProcess = spawn('npx', [
      'concurrently',
      '--kill-others-on-fail',
      '--prefix-colors', 'cyan,magenta',
      '--names', 'CLIENT,SERVER',
      `"VITE_PORT=${frontendPort} VITE_API_URL=http://localhost:${backendPort} bun run dev:client"`,
      `"BACKEND_PORT=${backendPort} bun run dev:server"`
    ], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_PORT: frontendPort.toString(),
        VITE_API_URL: `http://localhost:${backendPort}`,
        BACKEND_PORT: backendPort.toString()
      }
    });
    
    // Handle process termination
    const cleanup = () => {
      console.log('\n🛑 Shutting down development servers...');
      devProcess.kill('SIGTERM');
      setTimeout(() => {
        devProcess.kill('SIGKILL');
        process.exit(0);
      }, 3000);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    devProcess.on('exit', (code) => {
      console.log(`\n📋 Development servers exited with code: ${code}`);
      process.exit(code || 0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start development servers:', error);
    process.exit(1);
  }
}

startDevServers();