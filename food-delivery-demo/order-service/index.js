// order-service/index.js
// -----------------------------------------------
// The Order Service handles order creation.
// It is an independent microservice — it knows nothing about the Customer Service.
//
// Slide reference: "Our Chosen Approach: Microservices + Event-Driven"
// "Microservices break down the system into manageable, independently deployable units."
//
// Slide reference: "Architecture Pattern: Publish-Subscribe"
// "When an order is placed, the Delivery Service can immediately start finding a driver,
//  and the Notification Service can alert the customer — all without direct calls."

const express = require('express');
const EventEmitter = require('events');

const app = express();
app.use(express.json());

// --- EVENT BUS ---
// In production this would be Kafka or RabbitMQ.
// Here we simulate it with Node's built-in EventEmitter.
// Slide diagram: [Order Service] → [Event Bus] → [Delivery Service] → [Notification Service]
const eventBus = new EventEmitter();


// --- SUBSCRIBERS (other services listening to events) ---

// Delivery Service: reacts when an order is created
eventBus.on('order:created', (order) => {
  console.log(`  [Event → Delivery Service]    Assigning driver for Order #${order.id} (${order.item})`);
});

// Notification Service: reacts when an order is created
eventBus.on('order:created', (order) => {
  console.log(`  [Event → Notification Service] Sending SMS to customer for Order #${order.id}`);
});

// Analytics Service: reacts when an order is created
eventBus.on('order:created', (order) => {
  console.log(`  [Event → Analytics Service]    Logging Order #${order.id} to dashboard`);
});


// --- ENDPOINT ---

// POST /order — create a new order
app.post('/order', (req, res) => {
  // Build the order object (dummy data, no database needed)
  const order = {
    id: Date.now(),
    item: req.body.item || 'Pizza',
    status: 'Order Created'
  };

  console.log(`\n[Order Service] New order received: "${order.item}" (ID: ${order.id})`);

  // PUBLISH event to the event bus
  // The Order Service doesn't call Delivery or Notification directly.
  // It just announces the event — subscribers handle the rest.
  console.log(`[Order Service] Publishing 'order:created' event to Event Bus...`);
  eventBus.emit('order:created', order);

  // Return response to client
  res.json({ status: 'Order Created', order });
});


// Start the service
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`[Order Service] Running on http://localhost:${PORT}`);
  console.log(`[Order Service] POST /order`);
});
