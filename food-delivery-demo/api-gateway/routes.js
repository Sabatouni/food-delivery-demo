// routes.js — API Gateway Route Configuration
// -----------------------------------------------
// This file defines where each URL prefix gets forwarded.
// In Spring Boot, this would be application.yml with spring.cloud.gateway.routes
//
// Slide reference: "Architecture Pattern: API Gateway"
// Diagram: [User App] → [API Gateway] → [Order Service] / [Customer Service]

module.exports = {
  '/api/order': {
    target: 'http://localhost:3002',
    forwardPath: '/order',
    description: 'Routes to Order Service'
  },
  '/api/customer': {
    target: 'http://localhost:3001',
    forwardPath: '/customer',
    description: 'Routes to Customer Service'
  }
};
