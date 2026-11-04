<h1 align="center">Express Node Starter</h1>

<p align="center">
  A secure REST API starter with Express 5, MongoDB and JWT authentication.<br>
  Sign-up, roles, password reset, uploads, API docs, tests and Docker, ready to build on.
</p>

<p align="center">
  <a href="https://github.com/fadhlaouir/express-node-starter/actions/workflows/ci.yml"><img src="https://github.com/fadhlaouir/express-node-starter/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/fadhlaouir/express-node-starter/releases/latest"><img src="https://img.shields.io/github/v/release/fadhlaouir/express-node-starter" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

```bash
npx create-express-node-starter my-api --template auth
```

<p align="center">
  Creates a new project from this starter with <a href="https://github.com/fadhlaouir/create-express-node-starter">create-express-node-starter</a>, or clone it below.
</p>

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API](#api)
- [Project Structure](#project-structure)
- [Generating CRUD Operations](#generating-crud-operations)
- [Testing, Linting and Formatting](#testing-linting-and-formatting)
- [Running with Docker](#running-with-docker)
- [Security](#security)
- [Upgrading from 1.x](#upgrading-from-1x)
- [Bugs or Improvements](#bugs-or-improvements)
- [License](#license)

## Features

- **Authentication:** sign-up with email confirmation, sign-in, password reset by email, and changing your password.
- **Roles:** `is_user`, `is_manager` and `is_admin`, with a separate back-office sign-in for staff.
- **JWT tokens:** send `Authorization: Bearer <token>`; tokens hold only the user id and role.
- **Users:** profile with photo upload, paginated list for staff, self-service delete.
- **Uploads:** images only (JPEG, PNG, GIF, WebP), 5 MB maximum, stored under random names.
- **Security by default:** Helmet headers, rate limits on every API route and stricter ones on auth routes, NoSQL-injection-safe input, hashed passwords and email codes. See [Security](#security).
- **API docs:** Swagger UI at `/api-docs/`, from an OpenAPI 3 spec.
- **Health check** at `/health`, and graceful shutdown.
- **CRUD generator:** `npm run crud:operation -- generate product` writes a working model, controller and routes.
- **Tests:** 32 integration tests with an in-memory MongoDB; no database to install.
- **Tooling:** ESLint, Prettier, Husky and lint-staged, conventional-commit releases, Docker and GitHub Actions CI.

## Requirements

- Node.js **22.13 or later** (22 and 24 LTS are tested)
- MongoDB **6 or later**, local or hosted (for example MongoDB Atlas), or Docker

## Getting Started

```bash
git clone https://github.com/fadhlaouir/express-node-starter.git
cd express-node-starter
npm install
cp .env.example .env
```

Set `SECRET` in `.env` to a long random string:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then start the API:

```bash
npm run dev     # restarts on file changes
npm start       # without watching
```

```bash
Connected to the database
Listening on PORT 5000
```

Open [http://localhost:5000/api-docs/](http://localhost:5000/api-docs/) to try every endpoint.

**No mailer yet?** Leave `MAILER_EMAIL_ID` empty: the API skips sending and prints the confirmation and reset links in the console, so you can test the whole flow locally.

## Environment Variables

All of them are in [`.env.example`](.env.example). `npm start` and `npm run dev` load `.env` with Node's built-in `--env-file`; in production, set real environment variables.

| Variable                                                                                      | Required    | Purpose                                                  |
| --------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| `DEV_DATABASE` / `PROD_DATABASE`                                                              | Yes         | MongoDB connection string, chosen by `NODE_ENV`          |
| `SECRET`                                                                                      | Yes         | JWT signing secret; at least 32 characters in production |
| `JWT_EXPIRES_IN`                                                                              | No (`7d`)   | Token lifetime                                           |
| `PORT`                                                                                        | No (`5000`) | HTTP port                                                |
| `DEVELOPMENT_CLIENT_URL` / `PRODUCTION_CLIENT_URL`                                            | For emails  | Your front end, used in confirmation and reset links     |
| `CORS_ORIGIN`                                                                                 | No (`*`)    | Allowed origins, comma-separated                         |
| `API_RATE_LIMIT`                                                                              | No (`300`)  | Requests per IP per 15 minutes on every API route        |
| `AUTH_RATE_LIMIT`                                                                             | No (`20`)   | Requests per IP per 15 minutes on public auth routes     |
| `LOGIN_ACCOUNT_RATE_LIMIT`                                                                    | No (`10`)   | Failed sign-ins per account per 15 minutes, any address  |
| `MAILER_EMAIL_ID`, `MAILER_PASSWORD`, `MAILER_SERVICE_PROVIDER`, `HOST`, `PORT_SSL`, `SECURE` | For emails  | SMTP settings for nodemailer                             |

The server refuses to start without a database URL or `SECRET`, and tells you which one is missing.

## API

Everything is under `/v1/api`. Full request and response shapes are in Swagger at `/api-docs/`.

| Method | Path                          | Access                | Description                                |
| ------ | ----------------------------- | --------------------- | ------------------------------------------ |
| POST   | `/auth/register`              | Public                | Create an account (photo optional)         |
| POST   | `/auth/confirm/:code`         | Public                | Activate the account from the email link   |
| POST   | `/auth/resend-confirmation`   | Public                | Send a new confirmation email              |
| POST   | `/auth/login`                 | Public                | Sign in, returns a token                   |
| POST   | `/auth/admin/login`           | Admins and managers   | Back-office sign-in                        |
| POST   | `/auth/forget-password`       | Public                | Email a reset link                         |
| POST   | `/auth/reset-password/:token` | Public                | Set a new password                         |
| POST   | `/users/check-email`          | Public                | Whether an email is registered             |
| GET    | `/users`                      | Admins and managers   | Paginated list: `?page=1&limit=20`         |
| GET    | `/users/me`                   | Signed in             | The signed-in user                         |
| PUT    | `/users/me/password`          | Signed in             | Change password, returns a new token       |
| GET    | `/users/:id`                  | The user, or staff    | One user                                   |
| PUT    | `/users/:id`                  | The user, or staff    | Update name and photo; admins can set role |
| DELETE | `/users/:id`                  | The user, or an admin | Delete the account                         |

Responses share one shape: `{ "success": true, ... }`, or `{ "success": false, "message": "..." }` with a matching HTTP status.

**Email links** point to your front end (`/account/:code/enable` and `/auth/reset-password/:token`). Your front end reads the code from the URL and calls the matching API route.

## Project Structure

```sh
.
├── cli/                     # CRUD generator (npm run crud:operation)
├── src/
│   ├── app.js               # Express app: middleware, routes, errors
│   ├── docs.js              # Swagger UI at /api-docs
│   ├── swagger.json         # OpenAPI 3 spec
│   ├── config/              # Environment and database
│   ├── controllers/         # Request handlers
│   ├── middlewares/         # Auth, roles, uploads, rate limits, errors
│   ├── models/              # Mongoose models
│   ├── routes/              # Route files, registered automatically by index.js
│   ├── template/            # Email templates
│   └── utils/               # Mailer and request helpers
├── test/                    # Integration tests (node:test + in-memory MongoDB)
├── server.js                # Starts the server and shuts it down gracefully
├── Dockerfile
└── docker-compose.yml
```

**Adding an endpoint:** create `src/routes/<name>.route.js` exporting an Express router. `src/routes/index.js` registers every `*.route.js` file, so nothing else needs editing. Controllers can `throw new HttpError(status, message)` (from `src/utils/request.js`): Express 5 sends it to the error handler.

## Generating CRUD Operations

```bash
npm run crud:operation                              # interactive menu
npm run crud:operation -- generate product          # working CRUD with name and description
npm run crud:operation -- generate product --type empty
npm run crud:operation -- delete product --yes
```

The generated routes are `/v1/api/products` and `/v1/api/products/:id`; creating, updating and deleting require a token. See the [CLI README](cli/README.md).

## Testing, Linting and Formatting

```bash
npm test               # integration tests, with an in-memory MongoDB
npm run lint           # ESLint
npm run lint:fix
npm run format:check   # Prettier
npm run format:fix
```

Husky runs ESLint and Prettier on staged files before each commit, and lint and format checks before each push. GitHub Actions runs everything on Node 22 and 24.

## Running with Docker

```bash
SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))") docker compose up --build
```

This starts the API on port 5000 and MongoDB 8, with uploads and data in Docker volumes. The image runs as an unprivileged user and has a health check.

## Security

- Passwords are hashed with bcrypt. Confirmation and reset codes are random, single-use, and stored only as SHA-256 hashes; reset links expire after one hour.
- Sign-up never accepts a role or an activation flag from the request. Only admins can change roles.
- Users can read, update and delete only their own account; staff permissions are explicit per route.
- Request fields are checked as strings, so `{ "$ne": null }`-style query injection is rejected.
- Sign-in and password-reset answers don't reveal which emails have accounts, in what they say or in how long they take.
- A token is checked against its account on every request: deleting or deactivating the account, or changing or resetting its password, signs it out everywhere, and a role change applies at once. Changing your password returns a new token for the session that made the change.
- Emails are checked as addresses, and passwords are limited to the 72 bytes bcrypt reads, so a longer one can't match on its first 72 alone.
- Uploads accept images only, get random file names, and are served from a folder that can't be escaped.
- Every API route is rate limited (300 requests per IP per 15 minutes by default), public auth routes more strictly, and Helmet sets security headers.
- Failed sign-ins are also limited per account (10 per 15 minutes by default), so guessing one account's password from many addresses stops too. A successful sign-in doesn't count. The limits are kept in memory: with several instances behind a load balancer, give `express-rate-limit` a shared store such as Redis.
- Error responses never include stack traces or internal messages in production.

Found a vulnerability? Please report it privately: see the [security policy](SECURITY.md).

## Upgrading from 1.x

Version 2 fixes security issues in 1.x. If you started a project from 1.x, compare it with this version, in particular:

- **Roles:** `POST /auth/register` used to accept `role` and `is_active`, so anyone could register as an admin.
- **Tokens:** tokens used to contain the whole user, including the password hash.
- **Access:** any signed-in user could read, update or delete any other user, and `PUT /users/:id` could store a plain-text password.
- **Uploads:** `GET /uploads/:id` could read files outside the upload folder, and uploads accepted any file type.

Other changes: Node.js 22+, Express 5, Mongoose 9; `npm run develop` is now `npm run dev`; failed sign-ins return `401`; new routes for account confirmation and password change; `dotenv`, `nodemon` and `swagger-ui-express` are no longer needed.

## Bugs or Improvements

Every project needs improvements. Feel free to report any bugs or improvements; pull requests are always welcome. Please read the [code of conduct](CODE_OF_CONDUCT.md).

Found a security issue? Please don't open a public issue: see the [security policy](SECURITY.md).

## License

[MIT](LICENSE) © Raed Fadhlaoui

If this project saves you time, you can [buy me a coffee](https://www.buymeacoffee.com/fadhlaouir).
