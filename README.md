# Core API for Any Project

[![Author](http://img.shields.io/badge/author-@rfadhlaoui-blue.svg)](https://tn.linkedin.com/in/fadhlaouiraed)
[![GitHub license](https://img.shields.io/github/license/maitraysuthar/rest-api-nodejs-mongodb.svg)](https://github.com/Orange-Digital-Center-Tunisia/express-mongodb-api-architecture/blob/master/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/74c872e6a5ac45ce91ce0e24b6e57085)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=Orange-Digital-Center-Tunisia/express-mongodb-api-architecture&utm_campaign=Badge_Grade)
![Travis (.com)](https://img.shields.io/travis/com/maitraysuthar/rest-api-nodejs-mongodb)

REST API Developed with Node.js, Express, MongoDB and Firebase

## Getting started

This is a basic API skeleton written in JavaScript ES2015.

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
- Linting with [Eslint](https://eslint.org/).

## Software Requirements

- Node.js **14+**
- MongoDB **4+**

### Engines

- node **>=14.16.0 <=16.13.0**
- npm **>=6.14.11 <=8.1.0**

## How to install

### Using Git (recommended)

1.  Clone the project from github.

```bash
git clone https://github.com/fadhlaouir/express-mongodb-api-architecture.git
```

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd express-mongodb-api-architecture
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
├── app.js
├── index.js
├── src
│   ├── controllers
│   │   ├── AuthController.js
│   │   └── EventController.js
│   ├── middlewares
│   │   ├── multer.js
│   │   └── verify-token.js
│   ├── models
│   │   ├── EventModel.js
│   │   └── UserModel.js
│   ├── routes
│   │   ├── auth.js
│   │   └── event.js
│   ├── template
│   │   └── userAccountEmailTemplates.js
│   ├── utils
│   │   └── helpers.js
│   └── swagger.js
├── uploads
│   └── images.*
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

## ESLint

### Running Eslint

```bash
npm run lint:check
```

You can set custom rules for eslint in `.eslintrc.json` file, Added at project root.

## Bugs or improvements

Every project needs improvements, Feel free to report any bugs or improvements. Pull requests are always welcome.

## License

This project is open-sourced software licensed under the MIT License. See the LICENSE file for more information.
