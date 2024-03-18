#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const templatesDir = path.join(__dirname, 'templates');

async function main() {
  try {
    // Prompt user for project name and directory
    const { projectName, projectDirectory } = await promptProjectDetails();

    // Prompt user to choose template
    const selectedTemplate = await promptTemplateSelection();

    // Copy template to new project directory
    copyTemplate(selectedTemplate, projectDirectory);

    // Install dependencies
    await installDependencies(projectDirectory);

    console.log(
      `Project '${projectName}' created successfully in ${projectDirectory}`,
    );
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function promptProjectDetails() {
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      validate: (input) => !!input.trim(),
    },
    {
      type: 'input',
      name: 'projectDirectory',
      message: 'Enter project directory:',
      default: (answers) => `./${answers.projectName}`,
    },
  ];

  return inquirer.prompt(questions);
}

async function promptTemplateSelection() {
  const templates = fs.readdirSync(templatesDir);
  const questions = [
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: templates,
    },
  ];

  const { template } = await inquirer.prompt(questions);
  return template;
}

function copyTemplate(template, projectDirectory) {
  const templatePath = path.join(templatesDir, template);
  exec(`cp -r ${templatePath} ${projectDirectory}`);
}

async function installDependencies(projectDirectory) {
  return new Promise((resolve, reject) => {
    exec(`cd ${projectDirectory} && npm install`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(new Error(stderr));
      }
      resolve();
    });
  });
}

main();
