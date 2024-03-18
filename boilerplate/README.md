## CLI Commands

### How to Use CRUD Operations

To generate or delete CRUD operations, you can use the CLI provided in this project. The CLI allows you to automate the process of creating or removing CRUD (Create, Read, Update, Delete) operations for entities within a MongoDB database.

### Usage

#### Running the CLI

To run the CLI, execute the following command:

```bash
npm run crud-operation
```

Selecting Action
Upon running the CLI, you will be prompted to select an action to perform. You can choose between generating CRUD operations or deleting existing CRUD operations.

#### Generating CRUD Operations

If you select the option to generate CRUD operations, the CLI will guide you through the process. You will be prompted to enter the name of the entity for which you want to generate CRUD operations. Additionally, you will need to specify the type of CRUD operations you want to generate, whether empty or minimal.

#### Empty CRUD Operations

Empty CRUD operations include the basic structure for Create, Read, Update, and Delete operations. This option provides a starting point for implementing custom logic for each operation.

#### Minimal CRUD Operations

Minimal CRUD operations include a simplified version of Create, Read, Update, and Delete operations. This option provides basic functionality with minimal boilerplate code.

#### Deleting CRUD Operations

If you select the option to delete CRUD operations, the CLI will prompt you to enter the name of the entity for which you want to delete CRUD operations. Once confirmed, the CLI will remove all associated CRUD files for the specified entity.

### Example

Here's an example of how you can use the CLI to generate CRUD operations:

Run the CLI:

```bash
npm run crud-operation
```

1. Select the action "Generate CRUD."
2. Enter the name of the entity (e.g., "user") for which you want to generate CRUD operations.
3. Choose the type of CRUD operations (empty or minimal).
4. Follow the prompts to complete the generation process.

### Note

Ensure that you have the necessary permissions and dependencies installed before running the CLI. Additionally, make sure to review the generated CRUD files and modify them according to your application's requirements.

This documentation provides a clear overview of how to use the CLI to generate or delete CRUD operations in the project. Adjustments have been made to reflect the changes made in this version, including the implementation of delete CRUD and the change from `npm run generate-crud` to `npm run crud-operation`.
