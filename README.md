# Team 3 Frontend

A lightweight Express + TypeScript server used for Team 3 frontend coursework.

## Tech Stack

- Node.js
- TypeScript
- Express
- Nunjucks

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

Starts the app with file watching via `tsx watch`.

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

### 3. Build for production

```bash
npm run build
```

### 4. Start production build

```bash
npm start
```

## Available Scripts

- `npm run dev` - Run the server in watch mode for development.
- `npm run build` - Compile TypeScript into `dist/`.
- `npm start` - Run the compiled app from `dist/index.js`.
- `npm run lint` - Checks for style issues.
- `npm run lint:fix` - Run lint check and apply safe fixes.
- `npm test` - Executes unit tests.
- `npm run test:watch` - Runs unit tests in watch mode.
- `npm run test:coverage` - Generates coverage report.
- `npm run test:ui` - Executes UI unit tests.

## API Endpoints

### `GET /`

Returns a simple hello-world response.

Example response:

```text
Hello, World!
```

### `GET /health`

Returns a basic health check object with service status and current server time.

Example response:

```json
{
    "status": "UP",
    "time": "Tue Aug 04 2026 10:00:00 GMT..."
}
```

## Quick Check

After starting the app, you can verify endpoints with:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```
