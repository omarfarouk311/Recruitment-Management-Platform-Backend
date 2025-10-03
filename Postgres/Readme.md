# Postgres Database Architecture & Features
<img width="3529" height="2348" alt="image" src="https://github.com/user-attachments/assets/acc07783-be0d-4106-bc5b-f4c4ca497a25" />


This repository contains the PostgreSQL setup for our Recruitment Management Platform, designed to support high scalability, advanced search, and intelligent recommendations.

## Key Features

### 1. Asynchronous Replication
- **Architecture:** Single master node with two standby nodes.
- **Purpose:** Ensures high availability and data redundancy.
- **Setup:** Automated scripts for initializing replication and managing standby nodes.

### 2. Partitioning on Recommendations Table
- **Dynamic Partitioning:** The `recommendations` table is partitioned to optimize query performance and data management.
- **Automatic Partition Creation:** Triggers are implemented to create new partitions on the fly when the current partition approaches its size limit.

### 3. pgvector Extension
- **Usage:** Enables vector similarity search for job recommendations and candidate ranking.
- **Benefits:** Powers AI-driven matching and ranking by storing and querying vector embeddings efficiently.

### 4. Full Text Search
- **Indexes:** Utilizes both GIST and GIN indexes for fast and flexible full-text search capabilities.
- **Application:** Enhances search experience for jobs and companies.

### 5. Scripts & Configuration
- **Automated Setup:** Includes scripts for database creation, user management, partitioning, and replication.
- **Custom Configs:** Optimized `postgresql.conf` and `pg_hba.conf` for performance and security.

## Folder Structure
- `master/`, `standby1/`, `standby2/`: Data directories for each node.
- `configs/`: Configuration files for master and standby nodes.
- `scripts/`: SQL and shell scripts for setup and management.

## How to Use
1. **Start the cluster:**
   - Use `startup.sh` or `startup.ps1` to initialize the master and standby nodes.
2. **Replication:**
   - Scripts handle replication setup automatically.
3. **Partitioning & Triggers:**
   - Partition management is handled via triggers and scripts in the `scripts/` folder.
4. **pgvector & Full Text Search:**
   - Ensure the `pgvector` extension is installed and enabled.
   - Full text search is available out-of-the-box with pre-configured indexes.

## Technologies Used
- **PostgreSQL**
- **pgvector**
- **GIST & GIN Indexes**
- **Shell & PowerShell Scripts**

## Showcase
This database setup demonstrates:
- Scalable architecture with replication and partitioning
- AI-powered recommendations using vector search
- Advanced full-text search for a rich user experience
- Automated management for seamless operations

---
For more details, see the scripts and configuration files in this folder.
