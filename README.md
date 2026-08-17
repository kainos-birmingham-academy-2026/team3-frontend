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

Generate a secure secret for `SESSION_SECRET` below:

```bash
openssl rand -hex 32
```

Available variables:

- `SESSION_SECRET` - Secret used to sign the session cookie (required)
- `AUTH_LOGIN_PATH` - Backend login endpoint path used by the frontend auth service (default: `/api/login`)
- `AUTH_REGISTER_PATH` - Backend register endpoint path used by the frontend auth service (default: `/api/register`)
- `API_BASE_URL` - Base URL used for API requests (default: `http://localhost:4000`)
- `NODE_ENV` - Runtime environment (`development` or `production`)
- `PORT` - Port for this Express app (default: `3000`)

Example:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_LOGIN_PATH=/api/login
AUTH_REGISTER_PATH=/api/register
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

- Loads job roles for authenticated or unauthenticated visitors
- Sends the session JWT token to the backend when one is available
- If backend responds with `401`, redirects to `/login`
- If backend errors, renders the page with an error state

### `GET /job-role-list/:id`

Renders the details for a selected job role.

- Loads the role details from the backend
- If backend responds with `401`, clears the session and redirects to `/login`
- If the role cannot be loaded, renders an error state

### `GET /job-role-list/:id/apply`

Renders the application form for an authenticated user.

- Unauthenticated visitors are redirected to `/unauthorised`
- Applications are available only while the role is open and has open positions

### `POST /job-role-list/:id/apply`

Submits CV text for a job role.

- Requires an authenticated session
- Redirects to `/job-role-list/:id/apply/confirmation` after a successful submission
- Re-renders the form for missing CV text, duplicate applications, invalid role/application data, or oversized submissions

### `GET /job-role-list/:id/apply/confirmation`

Renders the application received confirmation page for an authenticated user.

### `GET /job-role-create`

Renders the create job role form for authenticated administrators.

- Requires an authenticated administrator session
- Loads capability, band, location, and status options from the backend
- Allows administrators to enter the role details, open positions, and optional closing date

### `POST /job-role-create`

Creates a job role through the backend `POST /job-roles/create` endpoint.

- Requires an authenticated administrator session
- On success: redirects to `/job-role-list`
- On validation failure: re-renders the form with the backend validation messages
- On insufficient permissions: renders the access restricted page
- On an unauthorised backend response: clears the session and redirects to `/login`

### `GET /job-applications/admin`

Renders the application review page for authenticated administrators.

- Loads submitted applications and job roles from the backend
- Provides filtering and search controls for reviewing applications

### `GET /job-applications/:applicationId/cv`

Renders the CV text for a selected application for authenticated administrators.

- Renders a not-found page for an invalid or unknown application ID

### `GET /api/job-applications/admin`

Returns submitted applications as JSON for authenticated administrators.

### `GET /api/job-applications/:applicationId/cv-text`

Returns the selected application's CV text as JSON for authenticated administrators.

### `POST /api/job-applications/:applicationId/status`

Approves or rejects an application for authenticated administrators.

- Send `{ "action": "approve" }` or `{ "action": "reject" }` in the JSON request body
- Returns a `400` response for an invalid application ID or action

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
- On success: redirects to `/register/confirmation`
- On failure: re-renders register with an error message

### `GET /register/confirmation`

Renders the registration confirmation page after a successful account creation.

### `GET /unauthorised`

Renders the unauthorised page when a protected page is accessed without a session.

### `GET /logout`

Destroys the session, clears `connect.sid`, and redirects to `/logout/confirmation`.

### `GET /logout/confirmation`

Renders the logout confirmation page.

### `GET /teapot`

Renders the teapot page.

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
# Sign in as an administrator before opening the create form.
curl http://localhost:3000/job-role-create
```
