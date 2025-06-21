# Email Server

This folder contains the **Email Server** microservice, responsible for sending emails asynchronously by consuming messages from a Kafka message broker. It is designed to handle various email notifications for the platform, such as job offers, interview invitations, phase changes, and more.

## Overview

The Email Server is a Node.js service that listens to a Kafka topic for email-related events. When a message is received, it parses the event, fetches any required data from the database, generates the appropriate email using predefined templates, and sends the email using the Mailjet API.

This approach decouples email sending from the main application logic, improving reliability and scalability.

## Features

- **Asynchronous Email Sending:** Emails are sent in response to events published to Kafka, ensuring non-blocking user operations.
- **Multiple Email Types:** Supports job offers, interview invitations, phase changes, job closing notifications, recruiter invitations, and more.
- **Template-Based:** Uses dynamic templates with placeholders for personalized content.
- **Database Integration:** Fetches additional data (e.g., user names, job titles) from the database as needed.
- **Error Handling:** Handles errors gracefully and commits Kafka offsets only after successful email delivery.
- **Scalable:** Can be scaled horizontally by running multiple instances.

## Architecture

1. **Kafka Consumer:** Listens to the `emails` topic for new email events.
2. **Database Access:** Uses PostgreSQL read replicas to fetch required data for email personalization.
3. **Templates:** Generates email content using templates in [`templates.js`](/Email%20Server/src/templates.js).
4. **Mailjet Integration:** Sends emails via the Mailjet transactional email API.
5. **Offset Management:** Commits Kafka offsets only after successful email delivery to ensure at-least-once delivery semantics.

## Folder Structure

```
Email Server/
├── config/
│   ├── config.js         # Service configuration and environment variables
│   ├── db.js             # PostgreSQL connection pools (read replicas)
│   ├── kafka.js          # Kafka consumer setup
│   └── mailjet.js        # Mailjet API client setup
├── src/
│   ├── app.js            # Main service entry point and Kafka consumer logic
│   └── templates.js      # Email template definitions and rendering logic
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env                  # (Not included) Environment variables
```

## Configuration

All configuration is managed via environment variables, loaded in [`config.js`](/Email%20Server/config/config.js). This includes database credentials, Kafka broker addresses, Mailjet API keys, and sender information.

## Environment Variables

The following environment variables are required (see [`config.js`](/Email%20Server/config/config.js)):

- `KAFKA_EMAILS` - Kafka topic for emails
- `KAFKA_BROKER1`, `KAFKA_BROKER2` - Kafka broker addresses
- `STANDBY1_NAME`, `STANDBY2_NAME` - PostgreSQL replica hostnames
- `DB_USER`, `DB_USER_PASSWORD`, `DB_PORT`, `DB_NAME` - PostgreSQL credentials
- `SENDER_EMAIL` - Email address used as the sender
- `MAILJET_PUBLIC_API_KEY`, `MAILJET_PRIVATE_API_KEY` - Mailjet API keys

## Kafka Topics

The service listens to the topic specified by the `KAFKA_EMAILS` environment variable. Other services in the system publish email events to this topic.

## Email Templates

Templates are defined in [`templates.js`](/Email%20Server/src/templates.js). Each template function generates both plain text and HTML versions of the email, supporting dynamic placeholders for personalization.

Supported templates include:

- **Job Closing Notification**
- **Phase Change Notification**
- **Interview Invitation**
- **Job Offer**
- **Recruiter Invitation**
- **Job Offer Acceptance/Decline**

Templates fetch additional data from the database as needed (e.g., job title, company name, user names).

## How It Works

1. **Startup:** The service connects to Kafka and subscribes to the email topic.
2. **Message Handling:** For each message:
   - Parses the event type and relevant IDs.
   - Fetches any required data from the database.
   - Selects and renders the appropriate email template.
   - Sends the email via Mailjet.
   - Commits the Kafka offset only if the email was sent successfully.
3. **Error Handling:** If email sending fails, the offset is not committed, allowing for retry.

## Running the Service

### Prerequisites

- Access to a running Kafka cluster
- Access to a PostgreSQL database (read replicas)
- Mailjet account and API keys

### Build and run using Docker Compose:

```sh
docker compose up -d
```
