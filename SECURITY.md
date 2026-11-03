# Security Policy

## Supported Versions

This is a starter: once you clone it, the code is yours to maintain. Security fixes land on `main` and in the latest release only, so check the [security advisories](https://github.com/fadhlaouir/express-node-starter/security/advisories) and apply fixes to projects you already started from it.

| Version | Supported |
| ------- | --------- |
| Latest  | ✅        |
| Older   | ❌        |

## What to Report

- **Authentication and authorization**: registration, login, JWT handling, roles, password reset.
- **File uploads**: the multer configuration and the `/uploads` routes.
- **Input handling**: anything that lets a request read or change data it shouldn't.
- **Dependencies**: a known vulnerability in a dependency that affects the starter.
- **The CRUD generator** (`cli/`): anything that writes outside the project or runs unexpected commands.

## Reporting a Vulnerability

Please report it privately, never in a public issue:

- **Preferred:** [open a private security advisory](https://github.com/fadhlaouir/express-node-starter/security/advisories/new) on GitHub.
- **Or by email:** [raed.fadhlaoui@hotmail.com](mailto:raed.fadhlaoui@hotmail.com).

Include the commit or version you used, the request or steps that reproduce the issue, and what an attacker could do with it.

## Response Timeline

- We acknowledge your report within 48 hours.
- We confirm the issue and share a plan within 7 days.
- Once fixed, we publish a GitHub security advisory and credit you unless you prefer not to be named.
