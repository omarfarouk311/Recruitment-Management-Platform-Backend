# MinIO Object Store

This folder contains the configuration and setup for the MinIO object storage service used in this project. MinIO is a high-performance, S3-compatible object storage solution that is deployed here via Docker Compose. It is used to store and manage media files, specifically:

- **CVs**
- **Images**

Each file type is stored in its dedicated bucket for better organization and access control.

## File Structure

- [`docker-compose.yml`](/MinIO/docker-compose.yml): Docker Compose file to deploy the MinIO service.
- [`.env`](/MinIO/.env): Environment variables for MinIO configuration (credentials, etc.).

## Buckets

The MinIO instance is configured to use two buckets:

1. **CVs Bucket:**  
   Stores uploaded CV documents (PDF).
2. **Images Bucket:**  
   Stores image files (PNG, JPG, etc.) related to users.

> **Note:** Bucket creation is handled by the backend application on startup.

## Usage

### 1. Environment Variables

The `.env` file should define:

```
MINIO_ROOT_USER=<your-access-key>
MINIO_ROOT_PASSWORD=<your-secret-key>
```

These credentials are required for both the web console and programmatic access.

### 2. Starting the Service

To start MinIO using Docker Compose:

```sh
docker compose up -d
```

### 3. Accessing the MinIO Console

- Modify the [`docker-compose.yml`](/MinIO/docker-compose.yml) file to expose the container port by adding `ports: - 9001:9001`
  to the object-store service.

- **Web Console:**  
  Visit `http://localhost:9001` in your browser.

### 4. Connecting from the Application

- **Endpoint:**  
  `http://object-store:9000` (from within the Docker network)
- **Bucket Management:**  
  On startup, the application checks for the existence of the two required buckets (`images` and `cvs`).
  - If a bucket does not exist, it is created automatically.
  - This ensures that the object storage is always ready for storing CVs and images, and that the required buckets are present before any file operations are attempted.

## Security Notes

- **Credentials:**
  Always use strong, unique credentials in your `.env` file.
- **Network Isolation:**
  The service is only accessible to other containers on the `internal-net` network by default, but the port can be exposed as mentioned.
- **Data Persistence:**
  All files are stored in the `minio-store` Docker volume, ensuring data is not lost when containers are restarted.
