# Contributing Guidelines

We welcome contributions to improve our project! Whether you want to report a bug, suggest a feature, or contribute code, please follow the guidelines outlined below.

## Reporting Bugs

If you encounter a bug in the project, please follow these steps to report it:

1. Check the existing issues to see if the bug has already been reported.
2. If the bug has not been reported, open a new issue.
3. Clearly describe the bug, including steps to reproduce it.
4. Provide any relevant information, such as error messages or screenshots.

To report a security issue, follow [SECURITY.md](../SECURITY.md) instead of opening a public issue.

## Suggesting Features

If you have an idea for a new feature or improvement, we'd love to hear about it! Follow these steps to suggest a feature:

1. Check the existing issues and pull requests to see if the feature has already been suggested or implemented.
2. If the feature has not been suggested, open a new issue.
3. Clearly describe the feature you would like to see added.
4. Explain why you think the feature would be beneficial.

## Contributing Code

We welcome contributions from developers of all skill levels! If you'd like to contribute code to the project, please follow these steps:

1. Fork the repository and create a new branch for your changes.
2. Make your changes and ensure they are properly tested.
3. Open a pull request with a clear title and description of your changes.
4. Ensure your code adheres to the project's coding style and conventions.

### Development

You need Node.js 22.13 or later. The tests use an in-memory MongoDB, so there is no database to install.

```bash
npm install
npm test
npm run lint
npm run format:check
```

The templates in [create-express-node-starter](https://github.com/fadhlaouir/create-express-node-starter) are generated from this repository, so a fix made here reaches them on the next sync.

## Code of Conduct

Please note that by contributing to this project, you agree to abide by the terms of the [Code of Conduct](../CODE_OF_CONDUCT.md). We expect all contributors to conduct themselves accordingly.

## License

By contributing to this project, you agree that your contributions will be licensed under the terms of the [MIT License](../LICENSE).

---

Thank you for contributing to our project and helping to make it better!
