// event-demo/index.js
// -----------------------------------------------
// Standalone demonstration of the Publish-Subscribe pattern.
// Run this with: node index.js
//
// Slide reference: "Architecture Pattern: Publish-Subscribe"
// Slide diagram:
//   [Order Service] → [Event Bus/Broker] → [Delivery Service]
//                                        → [Notification Service]
//                                        → [Analytics Service]
//
// In production: Event Bus = Kafka or RabbitMQ
// In this demo:  Event Bus = Node.js EventEmitter (same concept, simpler)

const EventEmitter = require('events');

// -----------------------------------------------
// THE EVENT BUS
// Acts as Kafka / RabbitMQ in this simulation.
// Publishers emit events here.
// Subscribers listen for events here.
// -----------------------------------------------
const eventBus = new EventEmitter();

console.log('==============================================');
console.log(' Publish-Subscribe Demo');
console.log(' Food Delivery System — Event-Driven Architecture');
console.log('==============================================\n');


// -----------------------------------------------
// SUBSCRIBERS
// Each service registers its interest in specific events.
// They do NOT call the publisher directly — they just listen.
// -----------------------------------------------

// Delivery Service — listens for 'order:created'
eventBus.on('order:created', (order) => {
  console.log(`  📦 [Delivery Service]    Received event! Assigning driver for Order #${order.id}...`);
});

// Notification Service — listens for 'order:created'
eventBus.on('order:created', (order) => {
  console.log(`  📱 [Notification Service] Received event! Sending SMS to customer: "Your ${order.item} is being prepared!"`);
});

// Analytics Service — listens for 'order:created'
eventBus.on('order:created', (order) => {
  console.log(`  📊 [Analytics Service]   Received event! Logging Order #${order.id} to dashboard.`);
});


// -----------------------------------------------
// PUBLISHER — The Order Service
// When a new order is placed, it publishes ONE event.
// It does NOT know or care who is listening.
// -----------------------------------------------
function placeOrder(item) {
  const order = {
    id: Math.floor(Math.random() * 9000) + 1000,
    item: item,
    timestamp: new Date().toISOString()
  };

  console.log(`\n[Order Service] Customer placed an order: "${item}" (Order ID: ${order.id})`);
  console.log(`[Order Service] Publishing 'order:created' event to Event Bus...\n`);

  // Publish the event — all subscribers react automatically
  eventBus.emit('order:created', order);
}


// -----------------------------------------------
// SIMULATION — place two orders with a delay
// -----------------------------------------------
placeOrder('Margherita Pizza');

setTimeout(() => {
  console.log('\n----------------------------------------------');
  placeOrder('Chicken Burger');
}, 2000);

setTimeout(() => {
  console.log('\n==============================================');
  console.log(' Key takeaway:');
  console.log(' The Order Service published ONE event.');
  console.log(' THREE services reacted — independently.');
  console.log(' No direct calls between services.');
  console.log(' This is Publish-Subscribe.');
  console.log('==============================================');
}, 4000);
