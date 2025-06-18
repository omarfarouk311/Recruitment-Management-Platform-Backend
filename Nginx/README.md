# Nginx Reverse Proxy

This folder contains the configuration and setup for the Nginx reverse proxy used. The Nginx server acts as a gateway for API requests, serves frontend static files, provides load balancing, implements rate limiting, and caches static assets (such as company images) to optimize performance and security.

## Features

- **Reverse Proxy for API**: Forwards `/api` requests to the backend API server.
- **Load Balancing**: Uses the `least_conn` strategy to distribute requests among backend servers.
- **Frontend Static File Serving**: Serves frontend files from `/var/www/frontend`, with fallback to `index.html` for SPA routing.
- **Static Caching**: Caches company image responses for improved performance and reduced backend load.
- **Rate Limiting**: The number of requests per IP for API and image endpoints is limited to prevent abuse.
- **Request Size Limiting**: Restricts client request body size for security and resource management.
- **Gzip Compression**: Enables gzip for faster content delivery.
- **Custom Headers**: Adds cache status headers for monitoring.

## File Structure

- [`nginx.conf`](/Nginx/nginx.conf): Main Nginx configuration file.
- [`proxy.conf`](/Nginx/proxy.conf): Included in proxy locations for shared proxy settings.
- [`Dockerfile`](/Nginx/Dockerfile): Builds the Nginx image and copies frontend files.
- [`docker-compose.yml`](/Nginx/docker-compose.yml): Docker Compose service definition for Nginx.

## Performance and Connection Settings

- **Worker Processes & Connections**:  
  The Nginx server is configured with `worker_processes auto;` to automatically set the number of worker processes based on available CPU cores, maximizing concurrency. The `events` block sets `worker_connections 8192`, allowing each worker to handle up to 8192 simultaneous connections.

- **Keepalive Connections**:  
  The `upstream backend` block uses `keepalive 16`, enabling up to 16 persistent connections (connection pooling) to each backend server. This reduces connection establishment overhead and improves performance for high-throughput scenarios.

- **HTTP/1.1 with Upstream**:  
  The proxy configuration (`proxy.conf`) explicitly sets `proxy_http_version 1.1` and manages the `Connection` header, ensuring compatibility with keep-alive connections.
  
## Configuration Details

### 1. Reverse Proxy & Load Balancing

- The `upstream backend` block defines backend servers (currently `api:3000`).
- The `/api` location proxies requests to the backend using settings from `proxy.conf`.
- Load balancing uses the `least_conn` method for optimal distribution.

### 2. Static File Serving

- Requests to `/` are served from `/var/www/frontend`.
- If a file is not found, Nginx serves `index.html` (SPA support).
- Only `GET` requests are allowed for static files; others are denied.

### 3. Image Caching

- Requests matching `/api/companies/<companyId>/image` are cached using a dedicated cache zone (`images_cache`).
- Both `GET` and `POST` responses with status 200 or 201 are cached for 1 day (to overwrite the cache in case of image update).
- The cache key is the full request URI.
- Adds `X-Cache-Status` header to indicate cache hits/misses.

### 4. Rate Limiting

- API requests: Limited to 10 requests per second per IP (`api_zone`).
- Image requests: Limited to 30 requests per second per IP (`images_zone`).
- Bursts are allowed for both, with no delay.

### 5. Gzip Compression

- Gzip is enabled for various content types to reduce bandwidth usage.

### 6. Request Size Limits

- API and proxy requests: Maximum body size is 10MB.
- Static file uploads: Maximum body size is 1MB.

## Usage

### Build and Run with Docker Compose

1. **Build and Start Nginx:**
   ```sh
   docker compose up -d
   ```

2. **Access the Services:**
   - Nginx will be available on port `8080` (mapped to container port `80`).
   - API requests: `http://localhost:8080/api/...`
   - Frontend: `http://localhost:8080/`

3. **Network Configuration:**
   - Nginx is attached to the `internal-net` Docker network.

## Notes

- The Nginx container expects the frontend build output (`dist/`) to be present at build time.
- The backend API must be accessible as `api:3000` on the same Docker network, and must be started before starting the Nginx container.