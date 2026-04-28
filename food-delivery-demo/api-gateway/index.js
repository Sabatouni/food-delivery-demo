// api-gateway/index.js
// -----------------------------------------------
// The API Gateway is the single entry point for all client requests.
// It reads the route config and forwards each request to the correct service.
//
// Slide reference: "Architecture Pattern: API Gateway"
// "A single, unified entry point for all client requests,
//  abstracting the complexity of backend microservices."

const express = require('express');
const http = require('http');
const routes = require('./routes');

const app = express();
app.use(express.json());

// --- ROUTING LOGIC ---
// For every request to /api/*, find a matching route and forward it.
app.all('/api/*', (req, res) => {
  // Find which route matches the incoming URL
  const prefix = Object.keys(routes).find(p => req.path.startsWith(p));

  if (!prefix) {
    return res.status(404).json({ error: 'No route found for: ' + req.path });
  }

  const route = routes[prefix];
  const url = new URL(route.target);

  console.log(`[API Gateway] ${req.method} ${req.path} → ${route.description} (${route.target}${route.forwardPath})`);

  // Build the forwarded request options
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: route.forwardPath,
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };

  // Forward the request to the backend service
  const proxy = http.request(options, (backendRes) => {
    res.status(backendRes.statusCode);
    backendRes.pipe(res); // stream response back to client
  });

  // Handle case where a backend service is not running
  proxy.on('error', () => {
    res.status(503).json({
      error: 'Service unavailable',
      hint: `Make sure the service at ${route.target} is running.`
    });
  });

  // If the request has a body (e.g., POST), send it along
  if (req.body && Object.keys(req.body).length > 0) {
    proxy.write(JSON.stringify(req.body));
  }

  proxy.end();
});

// Start the gateway
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n[API Gateway] Running on http://localhost:${PORT}`);
  console.log('[API Gateway] Registered routes:');
  Object.entries(routes).forEach(([prefix, r]) => {
    console.log(`  ${prefix} → ${r.target}${r.forwardPath}  (${r.description})`);
  });
});
