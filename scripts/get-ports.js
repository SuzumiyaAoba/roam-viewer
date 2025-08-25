import { getPort } from 'get-port-please';

// Get available ports for both servers
const frontendPort = await getPort({ port: 3000, portRange: [3000, 3010] });
const backendPort = await getPort({ port: 3001, portRange: [3001, 3011] });

console.log(JSON.stringify({
  frontend: frontendPort,
  backend: backendPort
}));