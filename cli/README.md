## CLI Commands

### Generate or delete CRUD files

The CLI writes a model, a controller and a route file for an entity. Routes are registered automatically by `src/routes/index.js`, so no other file needs editing.

```bash
npm run crud:operation
```

Without arguments, the CLI shows a menu. You can also pass everything on the command line, for scripts:

```bash
# Working CRUD with name and description fields (default)
npm run crud:operation -- generate product

# Empty handlers to fill in yourself
npm run crud:operation -- generate product --type empty

# Delete the files, without asking for confirmation
npm run crud:operation -- delete product --yes
```

### What you get

For `generate product`:

| File                                    | Contents                                                              |
| --------------------------------------- | --------------------------------------------------------------------- |
| `src/models/product.model.js`           | Mongoose model with timestamps                                        |
| `src/controllers/product.controller.js` | Create, list (paginated), get, update and delete                      |
| `src/routes/product.route.js`           | `/v1/api/products` and `/v1/api/products/:id`; writes require a token |

**minimal** reads only the `name` and `description` fields from the request body. Add fields to the model and to `pickFields` in the controller together.

**empty** creates the same files with handlers that answer `501 Not implemented` until you write them.

### Notes

- Entity names must start with a letter and contain only letters, numbers and underscores.
- The CLI refuses to overwrite existing files.
- Restart the server after generating or deleting a CRUD (`npm run dev` restarts on its own).
