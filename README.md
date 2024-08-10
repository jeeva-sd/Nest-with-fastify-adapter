# NestJS Fastify Application

## Overview

This application is built with NestJS and Fastify.

## Features

- **JSON Configuration Loader**: Loads configuration settings based on the environment (development, production, etc.).
- **Custom Logger**: Provides color-coded logging for different levels (`log`, `error`, `warn`, `debug`, `verbose`, `info`, `exception`).
- **Sanitization Interceptor**: Validates and sanitizes request payloads, including multipart file uploads.
- **Multipart File Handling**: Supports uploading and processing of multipart files with validation.
- **Custom Error Handling**: Formats error responses with detailed messages and status codes.
- **Response Formatting**: Ensures a consistent response structure for all API responses.
- **Lint and Format**: Ensures code quality and consistency with linting and formatting.

## Configuration

### Environment Variables

Set the `NODE_ENV` environment variable to control which configuration file is loaded:

- **`development`**: Loads configuration from `development.json`.
- **`production`**: Loads configuration from `production.json`.
- **Other values**: Defaults to the `development` configuration.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/jeeva-sd/Nest-GS.git
   cd Nest-GS
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Running the App

- **Development Mode**

   ```bash
   npm run dev
   ```

- **Production Mode**

   ```bash
   npm run start:prod
   ```