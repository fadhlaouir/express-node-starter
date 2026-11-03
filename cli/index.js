#!/usr/bin/env node
/* -------------------------------------------------------------------------- */
/*                                DEPENDENCIES                                */
/* -------------------------------------------------------------------------- */
const path = require('node:path');
const readline = require('node:readline/promises');
const { parseArgs } = require('node:util');

const { generateMinimalCrud } = require('./_/generateMinimalCrud');
const { generateEmptyCrud } = require('./_/generateEmptyCrud');
const { deleteCrud } = require('./_/deleteCrud');
const { validateEntityName, isEntityExists } = require('./_/helpers');

/* -------------------------------------------------------------------------- */
/*                                    Usage                                   */
/* -------------------------------------------------------------------------- */
const usage = `Generate or delete CRUD files for an entity.

Usage:
  npm run crud:operation                                    Interactive menu
  npm run crud:operation -- generate <name> [--type minimal|empty]
  npm run crud:operation -- delete <name> [--yes]

  minimal (default): model with name and description, working CRUD logic
  empty: model and handlers to fill in yourself

Routes are registered automatically: no other file needs editing.`;

/* -------------------------------------------------------------------------- */
/*                                   Actions                                  */
/* -------------------------------------------------------------------------- */
const relative = (files) =>
  files.map((file) => `  ${path.relative(process.cwd(), file)}`).join('\n');

async function generate(name, type = 'minimal') {
  const entity = validateEntityName(name);
  if (!['minimal', 'empty'].includes(type)) {
    throw new Error('--type must be minimal or empty');
  }
  if (isEntityExists(entity)) {
    throw new Error(`Files for "${entity}" already exist`);
  }
  const files =
    type === 'empty'
      ? await generateEmptyCrud(entity)
      : await generateMinimalCrud(entity);
  console.log(
    `✅ ${type} CRUD generated for "${entity}":\n${relative(files)}\n\nRestart the server: the routes /v1/api/${entity}s are ready.`,
  );
}

async function remove(name, confirm) {
  const entity = validateEntityName(name);
  if (!isEntityExists(entity)) {
    console.log(`No CRUD files found for "${entity}"`);
    return;
  }
  if (!(await confirm(`Delete the CRUD files of "${entity}"? (y/N) `))) {
    console.log('Deletion cancelled.');
    return;
  }
  const files = await deleteCrud(entity);
  console.log(`🗑️  Deleted:\n${relative(files)}`);
}

/* -------------------------------------------------------------------------- */
/*                                    Main                                    */
/* -------------------------------------------------------------------------- */
async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      type: { type: 'string', short: 't' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) return console.log(usage);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Read answers line by line, so piped input (scripts, CI) works like typing.
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (question) => {
    process.stdout.write(question);
    const { value = '', done } = await lines.next();
    if (done) process.stdout.write('\n');
    return value.trim();
  };
  const confirm = async (question) =>
    values.yes || /^y(es)?$/i.test(await ask(question));

  try {
    let [action, name] = positionals;
    if (!action) {
      const choice = await ask(
        'Select action:\n  1) Generate CRUD\n  2) Delete CRUD\n  3) Exit\n> ',
      );
      action = { 1: 'generate', 2: 'delete' }[choice];
      if (!action) return console.log('Exiting...');
    }
    if (!['generate', 'delete'].includes(action)) {
      throw new Error(`Unknown action "${action}"\n\n${usage}`);
    }
    if (!name) name = await ask('Entity name: ');

    if (action === 'generate') {
      let type = values.type;
      if (!type && !positionals[1]) {
        type =
          (await ask('CRUD type, minimal or empty (minimal): ')) || 'minimal';
      }
      await generate(name, type);
    } else {
      await remove(name, confirm);
    }
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { generate, remove };
