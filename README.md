# Team 3 Frontend

A lightweight Express + TypeScript server used for Team 3 frontend.

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

### 2. Configure environment variables

Create a local environment file from the example:

```bash
cp .env.example .env
```

Available variables:

- `SESSION_SECRET` - Secret used to sign the session cookie (required)
- `AUTH_LOGIN_PATH` - Backend login endpoint path used by the frontend auth service (default: `/api/login`)
- `AUTH_REGISTER_PATH` - Backend register endpoint path used by the frontend auth service (default: `/api/register`)
- `APPLICATION_SUBMIT_PATH` - Backend endpoint path used to submit applicant CV and application status (default: `/api/applications`)
- `API_BASE_URL` - Base URL used for API requests (default: `http://localhost:4000`)
- `NODE_ENV` - Runtime environment (`development` or `production`)
- `PORT` - Port for this Express app (default: `3000`)

Example:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_LOGIN_PATH=/api/login
AUTH_REGISTER_PATH=/api/register
APPLICATION_SUBMIT_PATH=/api/applications
API_BASE_URL=http://localhost:4000
NODE_ENV=development
PORT=3000
```

### 3. Run in development mode

Starts the app with file watching via `tsx watch`.

```bash
npm run dev
```

The server runs on:

```text
http://localhost:3000
```

### 4. Build for production

```bash
npm run build
```

### 5. Start production build

```bash
npm start
```

## Available Scripts

- `npm run dev` - Run the server in watch mode for development.
- `npm run build` - Compile TypeScript into `dist/`.
- `npm start` - Run the compiled app from `dist/index.js`.
- `npm run lint` - Check for style issues.
- `npm run lint:fix` - Run lint checks and apply safe fixes.
- `npm test` - Execute unit tests.
- `npm run test:watch` - Run unit tests in watch mode.
- `npm run test:coverage` - Generate a coverage report.
- `npm run test:ui` - Execute UI unit tests.

## Routes

### `GET /`

Renders the branded home page.

### `GET /health`

Returns a basic health check object.

Example response:

```json
{
  "status": "UP",
  "time": "2026-08-10T10:00:00.000Z"
}
```

### `GET /job-role-list`

Renders the job role page using backend API data.

- Requires an authenticated session; unauthenticated users are redirected to `/login`
- Sends the session JWT token to the backend
- If backend responds with `401`, redirects to `/login`
- If backend errors, renders the page with an error state

### `GET /job-role-list/:id/apply`

Renders the applicant CV upload form for the selected role.

- Requires an authenticated session
- Requires `USER` role (applicant)
- Role must be `open` with `openPositions > 0`

### `POST /job-role-list/:id/apply`

Submits applicant CV for the selected role.

- Requires an authenticated session
- Requires `USER` role (applicant)
- Requires multipart `cv` file upload
- Sends application status as `in progress` to backend

### `GET /login`

Renders the login page.

- If user is already authenticated, redirects to `/`

### `POST /login`

Authenticates against the backend endpoint configured by `AUTH_LOGIN_PATH`.

- On success: stores JWT in session and redirects to `/`
- On failure: re-renders login with an error message

### `GET /register`

Renders the registration page.

- If user is already authenticated, redirects to `/`

### `POST /register`

Registers via backend endpoint configured by `AUTH_REGISTER_PATH`.

- Requires email, password, and confirm password
- Password and confirm password must match
- Password must be more than 8 characters and include uppercase, lowercase, and special characters
- On success: redirects to `/login?registered=1`
- On failure: re-renders register with an error message

### `GET /logout`

Destroys session, clears `connect.sid`, and redirects to `/login`.

## Backend Dependency

Run the backend application used for this feature and follow its setup instructions:

https://github.com/kainos-birmingham-academy-2026/team3-backend 

Useful checks:

```bash
curl http://localhost:3000/health
curl http://localhost:4000/health
```

## Quick Check

After starting the app, verify key pages:

```bash
curl http://localhost:3000/
curl http://localhost:3000/login
curl http://localhost:3000/job-role-list
```
