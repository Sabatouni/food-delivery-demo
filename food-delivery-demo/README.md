# Food Delivery System — Architecture Demo

A minimal Node.js microservices project built to demonstrate the core architectural concepts behind scalable food delivery platforms such as Uber Eats and Meituan.

This project was created for a Software Architecture course project at NJUST and focuses on:

* Microservices Architecture
* API Gateway Pattern
* REST APIs
* Publish–Subscribe Communication
* Event-Driven Architecture
* Scalability Concepts

---

# Project Overview

Modern food delivery systems must process large numbers of requests simultaneously while keeping services independent and scalable.

Instead of building one large monolithic application, this project separates responsibilities into small independent services:

* `customer-service` → handles customer data
* `order-service` → handles order creation
* `api-gateway` → routes incoming requests
* `event-demo` → demonstrates Publish–Subscribe communication

The system combines:

* **REST-based communication** for direct client requests
* **Event-driven communication** for background processes

---

# Framework Used

This project uses:

* Node.js as the runtime environment
* Express.js as the web framework

Node.js allows JavaScript to run on the server side, while Express.js provides lightweight routing and HTTP request handling for building REST APIs.

Express.js fits microservices architecture well because:

* it is lightweight
* services start quickly
* each service can remain small and independent
* APIs can be implemented with minimal boilerplate code

---

# Architecture Overview

## 1. Microservices Architecture

The system is divided into independent services, where each service owns one business responsibility.

Examples:

* `customer-service` manages customer operations
* `order-service` manages order processing

Each service:

* runs independently
* has its own port
* can be modified or scaled separately

This improves:

* scalability
* maintainability
* fault isolation

---

## 2. API Gateway Pattern

The `api-gateway` acts as the single entry point to the system.

Instead of the client calling services directly, all requests first go through the gateway:

```text
Client → API Gateway → Services
```

Example:

* `GET /api/customer` → forwarded to Customer Service
* `POST /api/order` → forwarded to Order Service

The gateway:

* reads route definitions from `routes.js`
* forwards requests to the correct backend service
* hides internal service details from the client

---

## 3. Publish–Subscribe (Event-Driven Communication)

When an order is created, the Order Service publishes an event:

```text
order:created
```

Other components subscribe to this event and react independently:

* Delivery Service
* Notification Service
* Analytics Service

```text
Order Service → Event Bus → Subscribers
```

This demonstrates:

* asynchronous communication
* loose coupling
* event-driven architecture

The project uses Node.js `EventEmitter` to simulate an event bus. In production systems, technologies like Kafka or RabbitMQ would typically be used.

---

# REST vs Event-Driven Communication

The system uses both communication styles because they solve different problems.

## REST Communication (Synchronous)

Used when the client needs an immediate response.

Example:

```text
GET /customer
POST /order
```

Flow:

```text
Client → API Gateway → Service → Response
```

---

## Event-Driven Communication (Asynchronous)

Used when one action triggers multiple background processes.

Example:

* assigning a driver
* sending notifications
* logging analytics

Flow:

```text
Order Created → Event Published → Multiple Subscribers React
```

The sender does not wait for subscribers to finish processing.

---

# Communication Flow

## Customer Request Flow

```text
Client
   ↓
API Gateway (port 8080)
   ↓
Customer Service (port 3001)
   ↓
JSON Response
```

---

## Order Creation Flow

```text
Client
   ↓
API Gateway
   ↓
Order Service
   ↓
Publishes "order:created" Event
   ↓
Delivery / Notification / Analytics React
```

This demonstrates asynchronous event-driven communication.

---

# Folder Structure

```text
food-delivery-demo/
├── api-gateway/
│   ├── index.js
│   ├── routes.js
│   └── package.json
│
├── order-service/
│   ├── index.js
│   └── package.json
│
├── customer-service/
│   ├── index.js
│   └── package.json
│
├── event-demo/
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

# Important Files

## `api-gateway/routes.js`

Contains route configuration for forwarding requests to services.

Example:

```javascript
'/api/order': {
  target: 'http://localhost:3002',
  forwardPath: '/order'
}
```

---

## `api-gateway/index.js`

Implements the API Gateway logic:

* receives requests
* checks routing configuration
* forwards requests to services

---

## `order-service/index.js`

Handles:

* `POST /order`
* order creation
* event publishing using `eventBus.emit()`

---

## `customer-service/index.js`

Handles:

* `GET /customer`
* customer-related responses

Demonstrates independent service responsibility.

---

## `event-demo/index.js`

Standalone demonstration of Publish–Subscribe communication using `EventEmitter`.

Best file for observing event-driven architecture clearly.

---

# How to Run

## Requirements

* Node.js installed
* Terminal or VS Code terminal

---

## Step 1 — Install dependencies

Run once for each service:

```bash
cd api-gateway
npm install
```

```bash
cd order-service
npm install
```

```bash
cd customer-service
npm install
```

---

## Step 2 — Start services

### Customer Service

```bash
cd customer-service
node index.js
```

---

### Order Service

```bash
cd order-service
node index.js
```

---

### API Gateway

```bash
cd api-gateway
node index.js
```

---

# Testing the System

## Test Customer Service

```bash
curl http://localhost:8080/api/customer
```

Expected result:

```json
{
  "customers": [
    {
      "id": 1,
      "name": "Alice Johnson"
    }
  ]
}
```

---

## Test Order Creation

```bash
curl -X POST http://localhost:8080/api/order -H "Content-Type: application/json" -d "{\"item\":\"Pizza\"}"
```

Expected result:

```json
{
  "status": "Order Created"
}
```

Order Service terminal should also display Publish–Subscribe event logs.

---

# Event Demo

Run separately:

```bash
cd event-demo
node index.js
```

This demonstrates:

* publisher
* subscribers
* asynchronous event flow

without involving HTTP communication.

---

# Scalability Concepts

This project demonstrates scalability principles commonly used in real-world systems.

Examples:

* services can scale independently
* additional subscribers can be added without modifying Order Service
* the API Gateway centralizes routing logic

In real production systems:

* multiple instances of services run behind load balancers
* Kafka handles distributed event streaming
* Kubernetes manages service orchestration

---

# Loose Coupling

The system demonstrates loose coupling because services do not depend on each other's internal implementation.

Examples:

* the Order Service does not directly call Delivery Service
* subscribers react independently through events
* services communicate through stable interfaces

This improves:

* flexibility
* maintainability
* extensibility

---

# Current Limitations

This project is an educational architecture demo and not a production-ready system.

Not implemented:

* real Kafka/RabbitMQ
* database persistence
* authentication
* service discovery
* real load balancing
* distributed deployment

The event system is simulated using Node.js `EventEmitter`.

---

# Architecture Mapping

| Concept                    | Implementation                        |
| -------------------------- | ------------------------------------- |
| Microservices              | `order-service`, `customer-service`   |
| API Gateway                | `api-gateway/index.js`                |
| REST APIs                  | `app.get()`, `app.post()`             |
| Publish–Subscribe          | `eventBus.emit()` and `eventBus.on()` |
| Event-Driven Architecture  | `event-demo/index.js`                 |
| Asynchronous Communication | event publishing/subscribing          |
| Loose Coupling             | independent subscribers               |

---

# References

1. Martin Fowler — *Microservices Architecture*
2. Software Architecture in Practice
3. Event-Driven Microservices Architectures: Principles, Patterns and Best Practices (2025)
4. Containerized Event-Driven Microservice Architecture (2024)
