# Food Delivery System — Architecture Demo

A minimal Node.js project built to demonstrate the architecture concepts from the presentation:
**"Architecture Design of a Scalable Food Delivery System"**

---

## Project Overview

This project demonstrates three core architectural patterns discussed in the slides:

**1. Microservices Architecture**
Each service (`order-service`, `customer-service`) is an independent Node.js application running on its own port. They share no code and have no knowledge of each other — exactly as described in Slide 4: *"A collection of small, independent services, each owning a specific business function."*

**2. API Gateway**
The `api-gateway` acts as the single entry point for all client requests (Slide 7). Clients never talk to individual services directly. The gateway reads a route configuration file (`routes.js`) and forwards requests to the right service — just like the slide diagram:

```
[User App] → [API Gateway] → [Order Service]
                           → [Customer Service]
```

**3. Publish-Subscribe (Event-Driven)**
When an order is created, the Order Service publishes an `order:created` event to an Event Bus. The Delivery, Notification, and Analytics services all react independently — with no direct calls between them (Slide 8). In production this would use Kafka or RabbitMQ. Here it's simulated with Node's built-in `EventEmitter`.

```
[Order Service] → [Event Bus] → [Delivery Service]
                              → [Notification Service]
                              → [Analytics Service]
```

---

## Folder Structure

```
food-delivery-demo/
├── api-gateway/
│   ├── index.js       ← Gateway routing logic
│   ├── routes.js      ← Route config (like application.yml)
│   └── package.json
├── order-service/
│   ├── index.js       ← POST /order + pub/sub event publishing
│   └── package.json
├── customer-service/
│   ├── index.js       ← GET /customer
│   └── package.json
└── event-demo/
    ├── index.js       ← Standalone pub/sub simulation
    └── package.json
```

---

## How to Run

You need **Node.js** installed.

### Step 1 — Install dependencies for each service

Open a terminal and run each command:

```bash
cd api-gateway      && npm install && cd ..
cd order-service    && npm install && cd ..
cd customer-service && npm install && cd ..
```

### Step 2 — Start each service in a separate terminal window

**Terminal 1 — Customer Service (port 3001)**
```bash
cd customer-service
node index.js
```

**Terminal 2 — Order Service (port 3002)**
```bash
cd order-service
node index.js
```

**Terminal 3 — API Gateway (port 8080)**
```bash
cd api-gateway
node index.js
```

### Step 3 — Send requests through the API Gateway

Open a fourth terminal and run:

**Get customers:**
```bash
curl http://localhost:8080/api/customer
```

**Create an order:**
```bash
curl -X POST http://localhost:8080/api/order \
     -H "Content-Type: application/json" \
     -d '{"item": "Pizza"}'
```

> On Windows (Command Prompt), replace the `curl` command with:
> ```
> curl -X POST http://localhost:8080/api/order -H "Content-Type: application/json" -d "{\"item\": \"Pizza\"}"
> ```

---

## Expected Results

### When you GET /api/customer

**API Gateway terminal** logs:
```
[API Gateway] GET /api/customer → Routes to Customer Service (http://localhost:3001/customer)
```

**Customer Service terminal** logs:
```
[Customer Service] GET /customer — returning 2 customers
```

**Response:**
```json
{
  "customers": [
    { "id": 1, "name": "Alice Johnson", "email": "alice@example.com", "address": "123 Main St" },
    { "id": 2, "name": "Bob Smith",     "email": "bob@example.com",   "address": "456 Oak Ave" }
  ]
}
```

---

### When you POST /api/order

**API Gateway terminal** logs:
```
[API Gateway] POST /api/order → Routes to Order Service (http://localhost:3002/order)
```

**Order Service terminal** logs (this is the pub/sub in action):
```
[Order Service] New order received: "Pizza" (ID: 1714123456789)
[Order Service] Publishing 'order:created' event to Event Bus...
  [Event → Delivery Service]    Assigning driver for Order #1714123456789 (Pizza)
  [Event → Notification Service] Sending SMS to customer for Order #1714123456789
  [Event → Analytics Service]    Logging Order #1714123456789 to dashboard
```

**Response:**
```json
{
  "status": "Order Created",
  "order": { "id": 1714123456789, "item": "Pizza", "status": "Order Created" }
}
```

---

### Event-Demo (standalone)

Run this separately to see a clean pub/sub demonstration without any HTTP:

```bash
cd event-demo
node index.js
```

Expected output:
```
[Order Service] Customer placed an order: "Margherita Pizza" (Order ID: 4821)
[Order Service] Publishing 'order:created' event to Event Bus...

   [Delivery Service]    Received event! Assigning driver for Order #4821...
   [Notification Service] Received event! Sending SMS to customer: "Your Margherita Pizza is being prepared!"
   [Analytics Service]   Received event! Logging Order #4821 to dashboard.
```

