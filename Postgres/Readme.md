# Postgres Database Architecture & Features
<img width="3529" height="2348" alt="image" src="https://github.com/user-attachments/assets/acc07783-be0d-4106-bc5b-f4c4ca497a25" />


This repository contains the PostgreSQL setup for our Recruitment Management Platform, designed to support high scalability, advanced search, and intelligent recommendations.

## Key Features

### 1. Asynchronous Replication
- **Architecture:** Single master node with two replica nodes.
- **Purpose:** Ensures high availability and data redundancy.
- **Setup:** Automated scripts for initializing replication and managing replica nodes.

### 2. Partitioning on Recommendations Table
- **Dynamic Partitioning:** The `recommendations` table is partitioned to optimize query performance and data management.
- **Automatic Partition Creation:** Triggers are implemented to create new partitions on the fly when the current partition approaches its size limit.

### 3. pgvector Extension
- **Usage:** Enables vector similarity search for job recommendations and candidate ranking.
- **Benefits:** Powers AI-driven matching and ranking by storing and querying vector embeddings efficiently.

### 4. Full Text Search with pg_trgm
- **Extension:** Uses the `pg_trgm` extension for advanced text search and similarity matching.
- **Indexes:** Employs both GIST and GIN indexes on relevant columns to accelerate full-text and fuzzy search queries.
- **Application:** Enables fast, flexible, and typo-tolerant search for jobs and companies.

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
4. **pgvector & pg_trgm:**
   - Ensure the `pgvector` and `pg_trgm` extensions are installed and enabled.

## Technologies Used
- **PostgreSQL**
- **pgvector**
- **pg_trgm with GIST & GIN Indexes**
- **Shell & PowerShell Scripts**

## Showcase
This database setup demonstrates:
- Scalable and highly available architecture with replication and partitioning
- AI-powered recommendations using vector search
- Advanced full-text search for a rich user experience using pg_trgm
- Automated management for seamless operations

---
For more details, see the scripts and configuration files in this folder.
