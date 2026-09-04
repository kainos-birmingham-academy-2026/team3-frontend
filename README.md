# Team 3 Frontend

A lightweight Express + TypeScript server used for Team 3 frontend.

## Tech Stack

- Node.js
- TypeScript
- Express
- Nunjucks

## Infrastructure

Azure architecture, Terraform setup, and production deployment prerequisites
are documented in [infrastructure/README.md](infrastructure/README.md).

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
- `AUTH_LOGIN_PATH` - Backend login endpoint path used by the frontend auth service (default: `/api/auth/login`)
- `AUTH_REGISTER_PATH` - Backend register endpoint path used by the frontend auth service (default: `/api/auth/register`)
- `API_BASE_URL` - Base URL used for API requests (default: `http://localhost:4000`)
- `NODE_ENV` - Runtime environment (`development` or `production`)
- `PORT` - Port for this Express app (default: `3000`)

Example:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
AUTH_LOGIN_PATH=/api/auth/login
AUTH_REGISTER_PATH=/api/auth/register
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

## Running With Docker

These steps run the frontend in Docker and connect it to the Dockerised backend.

### 1. Build the frontend image

```bash
docker build -t frontend:1.0.0 .
```

### 2. Ensure the shared Docker network exists

The frontend and backend containers need to be on the same Docker network so the frontend can call the backend by container name.

```bash
docker network create team3-network
```

If Docker says the network already exists, that is fine.

### 3. Run the frontend container

Use `API_BASE_URL=http://team3-backend:4000` so the frontend calls the backend container. Do not use `localhost:4000` inside the frontend container, because `localhost` would mean the frontend container itself.

```bash
docker rm -f team3-frontend
docker run -d \
  --name team3-frontend \
  --network team3-network \
  -p 3000:3000 \
  --env-file .env \
  -e API_BASE_URL='http://team3-backend:4000' \
  frontend:1.0.0
```

### 4. Verify the frontend

```bash
curl http://localhost:3000/health
curl http://localhost:3000/job-role-list
docker logs team3-frontend
```

Then open:

```text
http://localhost:3000/job-role-list
```

## Available Scripts

- `npm run dev` - Run the server in watch mode for development.
- `npm run build` - Compile TypeScript into `dist/`.
- `npm start` - Run the compiled app from `dist/index.js`.
- `npm run lint` - Check for style issues.
- `npm run lint:fix` - Format files, apply safe lint fixes, and organize imports with Biome.
- `npm test` - Execute unit tests.
- `npm run test:watch` - Run unit tests in watch mode.
- `npm run test:coverage` - Generate a coverage report.
- `npm run test:ui` - Execute UI unit tests.
- `npm run e2e` - Run Playwright end-to-end tests in headless mode.
- `npm run e2e:smoke` - Run Playwright tests tagged as smoke tests.
- `npm run e2e:headed` - Run backend-independent Playwright tests with a visible browser.
- `npm run e2e:ui` - Open Playwright UI mode for interactive debugging.
- `npm run e2e:report` - Open the latest Playwright HTML report.

## Playwright E2E Framework

This repository includes a TypeScript Playwright framework focused on stable smoke tests for public frontend routes.

Structure:

```text
e2e/
  api/
    authApi.ts
  fixtures/
    api.ts
    auth.ts
    home.ts
    test.ts
  pages/
    homePage.ts
    loginPage.ts
    registerConfirmationPage.ts
    registerPage.ts
  specs/
    public-routes.spec.ts
    register-and-login.spec.ts
  support/
    config.ts
    db.ts
    testUser.ts
  globalSetup.ts
  globalTeardown.ts
playwright.config.ts
```

Good practices used:

- Local app bootstrapping through `webServer` in `playwright.config.ts` so tests are reproducible in CI and local development.
- Page Object Model for reusable selectors and assertions.
- Composable, domain-specific fixtures that can be extended as new test areas are added.
- Fixture modules are composed with Playwright's `mergeTests` utility.
- Focused smoke coverage on critical public routes and health endpoint.
- Smoke tests are tagged with `@smoke`, allowing coverage from multiple spec files to be run together.
- Failure diagnostics enabled with traces, screenshots, and videos.
- Multi-browser coverage across Chromium, Firefox, and WebKit.

Typical E2E workflow:

```bash
npx playwright install
npm run e2e
npm run e2e:report
```

### E2E environment configuration

Create your local E2E environment file from the tracked example:

```bash
cp .env.e2e.example .env.e2e
```

Playwright loads variables from `.env.e2e` first, then uses `.env` for any
variables that are not already set. Variables provided by the shell take
precedence over both files.

Set `PLAYWRIGHT_BASE_URL` in `.env.e2e` to test a deployed frontend:

```bash
PLAYWRIGHT_BASE_URL=https://example.com
```

If it is not set, Playwright uses `http://127.0.0.1:3000` by default. To
override the URL for one run:

```bash
PLAYWRIGHT_BASE_URL=https://example.com npm run e2e:headed
```

### BDD E2E tests

The registration and sign-in BDD suite uses Gherkin feature files in
`e2e/bdd/features` and TypeScript step definitions in `e2e/bdd/steps`. It
shares the same fixtures and Playwright configuration as the existing E2E
specifications.

```bash
npm run e2e:bdd
```

## Routes

### `POST /api/job-role-chat`

Public same-origin proxy for applicant job role questions.

- Forwards only the current question to the backend
- Limits each IP address to 100 requests per 10 minutes
- Returns grounded answers and matching job role links to the shared chat widget
- Returns a user-safe unavailable message when the backend or AI provider fails

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
- Opens a role's detail page when its table row is selected with a mouse, Enter, or Space
- Keeps Edit and Delete actions off the list to provide a compact, accessible table
- Sends the session JWT token to the backend when one is available
- If backend responds with `401`, redirects to `/login`
- If backend errors, renders the page with an error state

### `GET /job-role-list/:id`

Renders the details for a selected job role.

- Loads the role details from the backend
- Shows Edit and Delete actions at the top of the page for administrators
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

Creates a job role through the backend `POST /api/job-roles` endpoint.

- Requires an authenticated administrator session
- On success: redirects to `/job-role-list`
- On validation failure: re-renders the form with the backend validation messages
- On insufficient permissions: renders the access restricted page
- On an unauthorised backend response: clears the session and redirects to `/login`

### `GET /job-role-edit/:id`

Renders the edit form for an existing job role.

- Requires an authenticated administrator session
- Loads the selected role and its capability, band, and location options from the backend
- Pre-populates the form with the role's current values
- Allows an existing closing date in the past to remain selectable

### `POST /job-role-edit`

Updates a job role through the backend `PATCH /api/job-roles/:id` endpoint.

- Requires an authenticated administrator session
- On success: redirects to `/job-role-list/:id`
- On validation failure: re-renders the form with the submitted values and backend validation messages
- On insufficient permissions or a missing role: re-renders the form with an appropriate error
- On an unauthorised backend response: clears the session and redirects to `/login`

### `POST /job-role-list/:id/delete`

Deletes a job role through the backend `DELETE /api/job-roles/:id` endpoint.

- Requires an authenticated administrator session
- Is submitted from the confirmation dialog on the job role detail page
- On success: redirects to `/job-role-list`
- On insufficient permissions or a missing role: renders the job role list with an appropriate error
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
