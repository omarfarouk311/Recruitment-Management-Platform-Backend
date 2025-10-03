## Overview

A scalable, highly available backend platform for managing the hiring process, integrating AI to simplify and automate key steps such as CV parsing, candidate screening and ranking, and job recommendation. The system leverages modern technologies including **Node.js**, **PostgreSQL**, **Kafka**, **gRPC**, **Nginx**, **MinIo**, and **Docker** to deliver robust performance, reliability, and extensibility.

Key features include:
- **AI-powered CV parsing and job recommendations.**
- **Asynchronous processing and notifications via Kafka.**
- **Efficient file storage with MinIO.**
- **Rate limiting, load balancing, caching, and frontend files serving using Nginx.** 
- **Advanced search and ranking using PostgreSQL (pgvector, full-text search).**
- **Role-based & Attribute-based access control and secure authentication.**
- **Easy scaling and high availability with Docker Compose.**

## System Design
<img width="2994" height="1981" alt="System_Design2" src="https://github.com/user-attachments/assets/ce35a9e6-6d6c-44fe-9e8f-d5f163db4b77" />

## Project Structure

- [`Api Server`](./Api%20Server/README.md) — Main backend API, business logic, and orchestration.
- [`Email Server`](./Email%20Server/README.md) — Asynchronous email notifications.
- [`Logs Writing Server`](./Logs%20Writing%20Server/README.md) — Asynchronous logging of users actions.
- [`Kafka`](./Kafka/README.md) — Message broker cluster for event streaming.
- [`MinIO`](./MinIO/README.md) — Object storage for CVs and images.
- [`Nginx`](./Nginx/README.md) — Reverse proxy, load balancing, static caching, and static file serving.
- [`Postgres`](./Postgres/Readme.md) — Highly available PostgreSQL cluster with replication, partitioning, vector search, and full text search.

## How to Run the Project

Project lifecycle is managed using four shell scripts:

- **`launch.sh`** — Used for the initial launch. Sets up the Docker network, creates containers, volumes, and starts all services in the correct order.
- **`start.sh`** — Starts all containers if they have been previously created (after a stop).
- **`stop.sh`** — Stops all running containers without removing data or network.
- **`down.sh`** — Completely removes all containers, volumes, and the Docker network, erasing all persistent data.

### Typical Workflow

1. **First-time setup:**
   ```sh
   ./launch.sh
   ```
2. **Stop the system:**
   ```sh
   ./stop.sh
   ```
3. **Restart after stopping:**
   ```sh
   ./start.sh
   ```
4. **Remove everything (cleanup):**
   ```sh
   ./down.sh
   ```
   
**Note: Ensure you have Docker and Docker Compose installed, and that the internal-net Docker network does not conflict with existing networks.**

## More Information
- For details on each service, see the respective `README.md` files linked above.
- For environment variables and configuration, refer to the `.env` files and configuration sections in each service's documentation.
- For details about Frontend and AI Implementation, see [Recruitment Management Platform AI](https://github.com/AmrKhaled36/-Recruitment-Management-Platform-AI) and [Recruitment Management Platform Frontend](https://github.com/omarfarouk311/Recruitment-Management-Platform-Frontend).
