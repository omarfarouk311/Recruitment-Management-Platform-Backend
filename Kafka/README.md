# Kafka Message Broker Cluster

This folder contains the configuration and scripts for running a **Kafka** message broker cluster using Docker Compose. Kafka is used as the backbone for asynchronous communication between backend microservices, enabling decoupling, scalability, and fault tolerance across the system.

## Overview

Kafka is a distributed event streaming platform that allows services to communicate by publishing and consuming messages (events) asynchronously. In this project, Kafka is used to:

- Decouple services, so they can operate independently.
- Enable asynchronous processing (e.g., sending emails, logging actions, generating embeddings).
- Improve scalability by allowing multiple consumers to process messages in parallel.
- Provide fault tolerance and durability for critical business events.

## Why Kafka?

- **Decoupling:** Producers and consumers do not need to know about each other.
- **Asynchronous Processing:** Enables background jobs and event-driven workflows.
- **Scalability:** Kafka can handle high throughput and scale horizontally.
- **Fault Tolerance:** Messages are persisted, replicated, and can be replayed if needed. Each partition of a Kafka topic has a leader replica and one or more follower replicas, located on different brokers. Data is always written to the leader, and followers asynchronously replicate the data. If a broker fails, another replica can take over as the leader, ensuring no data is lost and the system remains available.
- **Durability:** Data is replicated across brokers by the leader-follower model for reliability.
- **Long Polling:** Kafka uses long polling, where consumers request new messages at their own pace. This allows consumers to process messages as they are ready, rather than being overwhelmed by a push-based system.
- **Distributed Partitions:** Topics in Kafka are split into multiple partitions, which can be distributed across brokers. This enables parallel processing, high throughput, and seamless scalability as more consumers or brokers may be added in the future (currently, we are using 1 partition per topic only because we have one consumer group per topic that has one consumer).

## Architecture

This setup uses two Kafka broker instances (`kafka1` and `kafka2`) for redundancy and high availability. Topics are created automatically at startup using an initialization script.

- **Brokers:** Two Kafka brokers managed by Docker Compose.
- **Topics:** Predefined topics for various backend services.
- **Network:** All services run on a shared Docker network (`internal-net`).

## Folder Structure

```
Kafka/
├── docker-compose.yml      # Docker Compose configuration for Kafka brokers
├── init.sh                 # Script to initialize and create required topics
├── delete_data.sh          # Bash script to stop services and clean data (Linux/macOS)
├── delete_data.ps1         # PowerShell script to stop services and clean data (Windows)
├── instance1/
│   ├── .env                # Environment variables for broker 1
│   └── data/               # Data directory for broker 1
└── instance2/
    ├── .env                # Environment variables for broker 2
    └── data/               # Data directory for broker 2
```

## Topics Managed

The following Kafka topics are created and managed by this setup (see [`init.sh`](/Kafka/init.sh)):

- `cv_parsing` &mdash; Used for asynchronous CV parsing
- `cv_embedding_generation` &mdash; Used for asynchronous user embedding generation when the user uploads a new CV
- `job_embedding_generation` &mdash; Used for asynchronous job embedding generation
- `profile_embedding_generation` &mdash; Used for asynchronous user embedding generation when the user adds or updates their info.
- `logs` &mdash; Used for asynchronous logging of company and recruiter actions
- `emails` &mdash; Used for asynchronous email notifications

## How It Works

1. **Startup:**  
   Run `docker-compose up -d` to start both Kafka brokers and the initialization container.
2. **Topic Initialization:**  
   The `kafka-init` service runs [`init.sh`](/Kafka/init.sh), which waits for brokers to be ready and then creates all required topics if they do not already exist.
3. **Service Communication:**  
   Services connect to the brokers (using addresses from `.env` files) to publish and consume messages on the relevant topics.

## Scripts

- [`init.sh`](/Kafka/init.sh):  
  Bash script runs at startup in a container to create all required Kafka topics.

- [`delete_data.sh`](/Kafka/delete_data.sh):  
  Bash script to stop the cluster and remove all broker data (Linux/macOS).

- [`delete_data.ps1`](/Kafka/delete_data.ps1):  
  PowerShell script to stop the cluster and remove all broker data (Windows).

## Running the Cluster

### Prerequisites

- `internal-net` Docker network created (see below)
- check that the [`init.sh`](/Kafka/init.sh) script end of sequence type is LF not CRLF


### Steps

1. **Create the Docker network (if not already present):**

   ```sh
   docker network create internal-net
   ```

2. **Start the Kafka cluster:**
   ```sh
   docker-compose up -d
   ```

## Cleaning Up

To stop the cluster and remove all broker data (including all topics and messages):

- **On Linux/macOS:**

  ```sh
  ./delete_data.sh
  ```

- **On Windows (PowerShell):**
  ```ps1
  .\delete_data.ps1
  ```

This will stop all containers and delete the data directories for both brokers.

## Notes

- All data is stored in the `data/` directories under each instance.
