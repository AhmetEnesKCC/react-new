// Will add typescipt support later

import arg from "arg";
import inquirer from "inquirer";
const execa = require("execa");
// import CLI from "clui";
import { createNpmFile, createManifestJson } from "../methods/execCommands";
import path from "path";
import clear from "clear";
import chalk from "chalk";
import createPureReact from "../methods/pureReact";
import execCommands from "../methods/execCommands";
import fs from "fs";
import Listr from "listr";
import { title } from "process";
import figlet from "figlet";
var globalValue = "New_Project";
const mustInstallPackages = ["react", "react-dom", "react-scripts"];

// LOGO
clear();
console.log(chalk.green(figlet.textSync("React New App", { horizontalLayout: "full" })));

async function promptForMissingOptions(options) {
  const defaultTemplate = "JavaScript";
  const defaultBase = "Function";

  const questions = [];
  const autoFix = (string) => {
    for (let i = 0; i < string.length; i++) {
      if (string[i] === " " && string[i + 1] === " ") {
        string = string.slice(i, 1);
      }
    }
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
        if (
          fs.readdirSync(process.cwd()).indexOf(value) >= 0 ||
          (fs.readdirSync(process.cwd()).indexOf("new_project") >= 0 && value === "New Project")
        ) {
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
    choices: ["redux", "sass", "react-router", "bootstrap", "font awesome 5" /*, "typescript"*/], // will add TS later
  });

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    base: options.base || answers.base,
    redux: options.redux || answers.redux,
    options: options.options || answers.options,
  };
}

export async function cli(args) {
  let options = await promptForMissingOptions(args);
  if (options.options.includes("Redux".toLowerCase())) {
    mustInstallPackages.push("redux", "react-redux", "redux-thunk");
  }
  if (options.options.includes("Sass".toLowerCase())) {
    mustInstallPackages.push("gulp-sass", "gulp", "gulp-autoprefixer", "gulp-minify-css", "gulp-sourcemaps");
  }
  if (options.options.includes("React-Router".toLowerCase())) {
    mustInstallPackages.push("react-router-dom", "react-router");
  }
  if (options.options.includes("bootstrap")) {
    mustInstallPackages.push("bootstrap", "react-bootstrap");
  }
  if (options.options.includes("font awesome 5")) {
    mustInstallPackages.push(
      "@fortawesome/fontawesome-svg-core",
      " @fortawesome/free-solid-svg-icons",
      " @fortawesome/react-fontawesome"
    );
  }
  let yarn = true;
  const testYarn = new Listr([
    {
      title: "Testing for yarn",
      task: (ctx, task) =>
        execa("yarn").catch(() => {
          yarn = false;
          task.skip("Installing yarn");
        }),
    },
    {
      title: "Installing Yarn",
      enabled: !yarn,
      task: () => execa("npm", ["install", "yarn", "-g"]),
    },
  ]);
  await testYarn.run().catch((err) => console.log(err));
  let packageArray = [];

  let installPackages = mustInstallPackages.map((pack) => {
    packageArray.push({
      title: "Installing " + pack,
      task: () => execa("yarn", ["add", pack], { cwd: path.join(process.cwd(), options.project_name) }),
    });
  });
  var installedVersion = "";
  var latestVersion = "";

  var Latest = true;
  let isReactNewAppLatest = () => {
    execa("npm", ["list", "react-new-app", "-g"]).catch((result) => {
      var index = result.indexOf("react-new-app");
      installedVersion = result.slice(index + 13, index + 18);
      console.log(installedVersion);
    });
    execa("npm", ["view", "react-new-app", "version"]).catch((result) => {
      latestVersion = result;
      console.log(latestVersion);
    });
    if (latestVersion != installedVersion) {
      Latest = false;
    }
  };

  const tasks = new Listr([
    {
      title: "Creating Files",
      task: async () => {
        return new Listr(
          [
            {
              title: "copying folders and files",
              task: async () => {
                return createPureReact(options);
              },
            },
            {
              title: "creating package.json",
              task: async () => {
                createNpmFile(options, mustInstallPackages);
                createManifestJson(options);
              },
            },
            {
              title: "Checking version of React New App",
              task: () => {
                execa("npm", ["list", "react-new-app", "-g"]).then((result) => {
                  if (result.stdout !== "") {
                    var index = result.stdout.indexOf("react-new-app");
                    installedVersion = result.stdout.slice(index + 14, index + 19);
                  }
                });
                execa("npm", ["view", "react-new-app", "version"]).then((result) => {
                  latestVersion = result.stdout;
                });

                if (latestVersion !== installedVersion) {
                  Latest = false;
                }
              },
            },
          ],
          { concurrent: true }
        );
      },
    },
    {
      title: "Installing Dependencies",
      task: () => new Listr(packageArray),
    },
  ]);

  await tasks.run().catch((err) => console.log(err));
  console.log(chalk.yellow("Thank you for used react-new"));
  console.log(chalk.green("Recommended"));
  console.log(`cd ${options.project_name}`);
  console.log(`npm start`);
  if (options.options.includes("sass")) {
    console.log(chalk.red("For sass ==>"));
    console.log("cd src");
    console.log(`gulp`);
  }
  console.log("Thank You For used React New");
  if (Latest) {
    console.log(chalk.yellow("\n\nThere is new version of react-new-app"));
    console.log("\n" + installedVersion + " --> " + latestVersion);
    console.log("Please update with -> " + "npm " + chalk.red("update ") + "react-new-app -g");
  }

  // execCommands("npm init -y");
}
