import arg from "arg";
import inquirer from "inquirer";
import { execSync, exec } from "child_process";
import CLI from "clui";
import path from "path";
import clear from "clear";
import { stat, fstat } from "fs";
import chalk from "chalk";
import createPureReact from "../methods/pureReact";
import execCommands from "../methods/execCommands";
import fs from "fs";
import shell from "shelljs";
const Spinner = CLI.Spinner;
var globalValue = "New_Project";
const mustInstallPackages = ["react", "react-dom"];

function parseArgumentOptions(rawArgs) {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    template: args._[0],
    runInstall: args["--install"] || false,
    project_name: "New",
    base: args._[0],
    redux: false,
    options: false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "JavaScript";
  const defaultBase = "Function";
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];
  const autoFix = (string) => {
    string = string.replace("-", "_").replace(" ", "_").toLowerCase();
    return string;
  };
  questions.push({
    type: "input",
    name: "project_name",
    message: "Please enter a valid name for your new react project",
    default: "New Project",
    validate: async function (value) {
      if (value.length > 0) {
        if (fs.readdirSync(process.cwd()).indexOf(value) >= 0) {
          return "There is already a folder named : " + autoFix(value);
        }
        if (value !== autoFix(value)) {
          options.project_name = autoFix(value);
          clear();
          console.log(chalk.yellow("\nfixing name\n"));
          return true;
        } else {
          options.project_name = value;
          return true;
        }
      } else {
        return "Please Enter a valid name";
      }
    },
  });

  questions.push({
    type: "list",
    name: "base",
    message: "Do you want function based or class based component ?",
    choices: ["Class", "Function"],
    default: defaultBase,
  });

  questions.push({
    type: "checkbox",
    name: "options",
    message: "please select which one do you want to use",
    choices: ["redux", "sass", "react-router", "typescript"],
  });
  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose which one do you want to use",
      choices: ["JavaScript", "TypeScript"],
      default: defaultTemplate,
    });
  }
  questions.push({
    type: "list",
    name: "redux",
    message: "Do you want to use redux",
    choices: ["Yes", "No"],
    default: "No",
  });
  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "init git repo",
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    base: options.base || answers.base,
    git: options.git || answers.git,
    redux: options.redux || answers.redux,
    options: options.options || answers.options,
  };
}

export async function cli(args) {
  const cli_func = async () => {
    let options = await parseArgumentOptions(args);
    let packageString = "";
    options = await promptForMissingOptions(options);
    console.log(options.options);
    console.log(options.project_name);

    if (options.redux === "Yes") {
      mustInstallPackages.push("redux", "react-redux", "redux-thunk");
    }
    console.log(options);
    // execCommands("npm init -y");
    await createPureReact(options);
    await console.log(execSync(`cd ${options.project_name} && npm init -y`, { encoding: "utf-8" }));
    mustInstallPackages.map((pack) => {
      console.log(
        execSync(`cd ${process.cwd()} && cd ${options.project_name} && npm install ${pack}`, { encoding: "utf-8" })
      );
    });
  };
  cli_func();
}
