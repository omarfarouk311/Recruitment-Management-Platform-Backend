# API Server

This folder contains the **API Server** for the platform backend, providing the main interface for all core features and business logic. It is a Node.js/Express application that exposes RESTful endpoints for clients, orchestrates complex workflows, and integrates with various infrastructure components such as gRPC, Kafka, MinIO, and PostgreSQL.

## Overview

The API Server is the central backend service for the platform, handling all HTTP(S) requests from clients (web, mobile, etc.), managing authentication, authorization, business logic, and communication with other services and infrastructure components. It is designed for scalability, reliability, and extensibility.

## Architecture

- **Express.js**: Main HTTP server and routing.
- **PostgreSQL**: Primary data store, accessed via crafted SQL queries and transactions for performance and consistency.
- **gRPC**: Used for communication with the parser server (e.g., parsing user CVs during profile completion).
- **Kafka**: Event streaming for logs, notifications, and asynchronous workflows.
- **MinIO**: Object storage for files such as CVs and images.
- **Node.js Streams**: Used for efficient file uploads/downloads and streaming data processing.
- **Parallel Promise Execution**: For efficient handling of concurrent asynchronous operations.

## Key Technologies

- **Node.js**
- **Express.js**
- **PostgreSQL** (with advanced SQL, transaction management, and connection pooling)
- **gRPC** (see [`grpc.js`](/Api%20Server/config/grpc.js))
- **Kafka** (see [`kafka.js`](/Api%20Server/src/common/kafka.js))
- **MinIO** (see [`MinIO.js`](/Api%20Server/config/MinIO.js))
- **Custom Middleware**: For error handling, validation, multipart parsing, etc.

## Features

- **User Management**: Registration, authentication, profile management, and image uploads.
- **Job Management**: Job creation, searching, recommendations, applications, and status tracking.
- **Company Management**: Company profiles, jobs, reviews, and images.
- **Recruitment Process**: Multi-phase recruitment workflows, including assessments and interviews.
- **CV Handling**: Upload, parse (via gRPC), download, and delete CVs with streaming and MinIO integration.
- **Reviews & Reports**: Company and seeker reviews and reporting system.
- **Logging & Auditing**: Action logs, event tracking, and Kafka-based log streaming.
- **Skills & Education**: Management of user skills and educational background.
- **Statistics**: Aggregated stats for seekers and companies.
- **Templates**: Job offer templates and communication management.
- **Advanced Authorization**: Role-based and Attribute-based access control.
- **Authentication Flow**: A secure authentication system using access tokens, refresh tokens, and token versioning for enhanced security and enabling secure, stateless authentication.
- **Multipart File Handling**: Efficient handling of multipart file uploads using custom middleware.
- **Error Handling**: Centralized error handling with custom error middlewares.
- **Scalable:** Can be scaled horizontally by running multiple instances.

## Folder Structure

```
Api Server/
├── config/                # Configuration files (DB, Kafka, MinIO, gRPC, etc.)
├── src/
│   ├── app.js             # Main Express app entry point
│   ├── common/            # Common utilities, middleware, error handling
│   ├── features/          # Main business features (modular structure)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .env
```

## Endpoints Structure

- The API is organized by feature, with each feature having its own set of routes, controllers, services, and models.
- Each route is handled by a controller, which delegates business logic to services and data access to models.

## Core Integrations

### gRPC (CV Parsing)

- **Purpose**: Used to parse CVs during user profile completion.
- **Reason for Usage**: gRPC is chosen for inter-service communication due to its high efficiency. It leverages HTTP/2 for multiplexed, low-latency connections and Protocol Buffers, a binary, compact data serialization format. This results in reduced bandwidth usage, faster communication, and better performance compared to traditional REST APIs.
- **Streaming**: Enables efficient streaming of file data from the API server to the parser server, allowing for real-time processing and reduced memory overhead.
- **References**: See [`cvService.js`](/Api%20Server/src/features/cvs/cvService.js) and [`grpc.js`](/Api%20Server/config/grpc.js) for implementation details.

### Kafka

- Used for asynchronous backend processing, logging, and notifications.
- Produces messages for actions like job creation, profile updates, and recruitment process changes.
- See [`kafka.js`](/Api%20Server/src/common/kafka.js).

### MinIO

- Object storage for user-uploaded files (CVs, images).
- Streaming uploads/downloads using Node.js streams for efficiency.
- See [`MinIO.js`](/Api%20Server/config/MinIO.js) and usage in controllers/services.

### PostgreSQL

- All business data is stored in PostgreSQL.
- Uses advanced SQL queries, transactions, and connection pooling.
- Models encapsulate data access and transaction logic.

## Environment Variables

- **Environment Variables**: Managed via `.env` and loaded in [`config.js`](/Api%20Server/config/config.js).

## Running the Service

### Prerequisites

- `internal-net` Docker network created (see below)

### Steps

1. **Create the Docker network (if not already present):**

   ```sh
   docker network create internal-net
   ```

2. **Start the API service (currently scaled to 2 instances):**
   ```sh
   docker compose up -d
   ```

## Notable Implementation Details

- **Streaming & Parallelism**: File uploads/downloads use Node.js streams for memory efficiency. Parallel execution of promises is used for tasks like sending notifications and updating multiple resources.
- **SQL queries & Transactions**: Models use hand-crafted SQL queries and explicit transaction management for data integrity and performance.
- **Validation & Error Handling**: Extensive use of validation middleware and centralized error handling.
- **Role-Based Access Control**: Middleware enforces permissions at both route and resource levels.
- **Extensibility**: Modular structure allows for easy addition of new features and integrations.
