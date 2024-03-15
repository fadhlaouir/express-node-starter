# Core API for Any Project

[![Author](http://img.shields.io/badge/author-@rfadhlaoui-blue.svg)](https://tn.linkedin.com/in/fadhlaouiraed)
[![GitHub license](https://img.shields.io/github/license/maitraysuthar/rest-api-nodejs-mongodb.svg)](https://github.com/fadhlaouir/express-node-starter/blob/main/LICENSE)

**REST API Developed with Node.js, Express, MongoDB**

## Overview

This project provides a robust API skeleton written in JavaScript ES6, suitable for any project. It offers features such as authentication, authorization, JWT tokens, role management, CRUD operations, email notifications, and more. Additionally, it automates the generation of CRUD (Create, Read, Update, Delete) operations for entities within a MongoDB database, streamlining the development process for Node.js applications built on top of Express.js.

## Getting started

This is a basic API skeleton written in JavaScript ES6.

This project will run on **NodeJs** using **MongoDB** as database.

API Documentation [Swagger]

## Features

- Authentication and Authorization
- JWT Tokens, make requests with a token after login with `Authorization` header with value `Bearer yourToken` where `yourToken` will be returned in Login response.
- Role Manage
- Update Profile/Password User Account
- Reset Password Mail using `nodemailer`
- Pre-defined response structures with proper status codes.
- Included CORS.
- System notification with Firebase
- Email Template and settings
- Validations added.
- Included API collection for Postman.
- Light-weight project.
- Linting with [Eslint](https://eslint.org/). (Airbnb style)
- Included CLI for generate CRUD operations.
- husky for pre-commit hooks and lint-staged for running linters on git staged files.

## Software Requirements

- Node.js **16+**
- MongoDB **4+**

### Engines

- node **>=14.16.0 <=20.11.0**
- npm **>=6.14.11 <=10.2.4**

## How to install

### Using Git (recommended)

1.  Clone the project from github.

```bash
git clone https://github.com/fadhlaouir/express-node-starter.git
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd express-node-starter
npm install
```

### Setting up environments

1.  You will find a file named `.env.example` on root directory of project.
2.  Create a new file by copying and pasting the file and then renaming it to just `.env`
    ```bash
    cp .env.example .env
    ```
3.  The file `.env` is already ignored, so you never commit your credentials.
4.  Change the values of the file to your environment. Helpful comments added to `.env.example` file to understand the constants.

## Project structure

```sh
.
├── .husky
├── cli
│   ├── generateCrud.js
│   └── index.js
├── src
│   ├── controllers
│   │   ├── auth.controller.js
│   │   └── user.ontroller.js
│   ├── middlewares
│   │   ├── multer.js
│   │   └── verify-token.js
│   ├── models
│   │   └── UserModel.js
│   ├── routes
│   │   ├── auth.route.js
│   │   └── user.route.js
│   ├── template
│   │   └── userAccountEmailTemplates.js
│   ├── utils
│   │   └── helpers.js
│   └── swagger.js
├── uploads
│   └── images.*
├── .env.example
├── .gitignore
├── .eslintrc.json
├── server.js
└── package.json
```

## How to run

### Running API server locally

```bash
npm run develop
```

You will know server is running by checking the output of the command `npm run develop`

```bash
Connected to the database:YOUR_DB_CONNECTION_STRING
App is running ...

Press CTRL + C to stop the process.
```

**Note:**

`YOUR_DEVELOPMENT_DB_CONNECTION_STRING` will be your MongoDB connection string for `development` environment.

`YOUR_PRODUCTION_DB_CONNECTION_STRING` will be your MongoDB connection string for `production` environment.

### Creating new models

If you need to add more models to the project just create a new file in `src/models/` and use them in the controllers.

### Creating new routes

If you need to add more routes to the project just create a new file in `src/routes/` and import it in `src/app` to be loaded.

### Creating new controllers

If you need to add more controllers to the project just create a new file in `src/controllers/` and use them in the routes.

### Using the CLI to generate CRUD operations

1. Navigate to the project directory.
2. Run the following command:

```bash
npm run generate-crud
```

Follow the prompts to select the CRUD type (empty or minimal) and provide the entity name. The tool will generate the necessary files for the CRUD operations based on your selection.

## ESLint

### Running Eslint

```bash
npm run lint:check
```

### Fixing Eslint errors

```bash
npm run lint:fix
```

### Prettier for code formatting

```bash
npm run format:fix
```

You can set custom rules for eslint in `.eslintrc.json` file, Added at project root.

## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.

## License

This project is open-sourced software licensed under the MIT License. See the LICENSE file for more information.

## Credits

- Raed FADHLAOUI: [Author Email](mailto:raed.fadhlaoui@hotmail.com)
- Project Repository: [GitHub Repository](https://github.com/fadhlaouir/express-node-starter)

## Support

For any inquiries or issues, please contact [Support Email](raed.fadhlaoui@hotmail.com).
