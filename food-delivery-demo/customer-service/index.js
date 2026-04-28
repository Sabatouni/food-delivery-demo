// customer-service/index.js
// -----------------------------------------------
// The Customer Service handles customer data retrieval.
// It is a completely separate microservice — independent of Order Service.
//
// Slide reference: "Microservices Architecture"
// "A collection of small, independent services, each owning a specific business function."
// This service owns everything related to customers.

const express = require('express');

const app = express();
app.use(express.json());

// Dummy customer data — no database needed for this demo
const customers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', address: '123 Main St' },
  { id: 2, name: 'Bob Smith',    email: 'bob@example.com',   address: '456 Oak Ave' },
];

// GET /customer — return the list of customers
app.get('/customer', (req, res) => {
  console.log(`[Customer Service] GET /customer — returning ${customers.length} customers`);
  res.json({ customers });
});

// GET /customer/:id — return a specific customer
app.get('/customer/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  console.log(`[Customer Service] GET /customer/${req.params.id} — found: ${customer.name}`);
  res.json({ customer });
});

// Start the service
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`[Customer Service] Running on http://localhost:${PORT}`);
  console.log(`[Customer Service] GET /customer`);
  console.log(`[Customer Service] GET /customer/:id`);
});
