// Will add typescipt support later

import arg from "arg";
import inquirer from "inquirer";
// import CLI from "clui";
import { createNpmFile, createManifestJson, createReactNewAppConfigJSON, addTemplate } from "../methods/execCommands";
import path from "path";
import clear from "clear";
import chalk from "chalk";
import createPureReact from "../methods/pureReact";
import execCommands from "../methods/execCommands";
import fs from "fs";
import Listr from "listr";
import { title } from "process";
import figlet from "figlet";
import templates from "../templates.json";
const execa = require("execa");
var globalValue = "New_Project";
const mustInstallPackages = [];
var packages = {
  react: ["react", "react-dom"],
  sass: ["gulp-sass", "gulp", "gulp-autoprefixer", "gulp-minify-css", "gulp-sourcemaps"],
  redux: ["redux", "react-redux", "redux-thunk"],
  router: ["redux", "react-redux", "redux-thunk"],
  bootstrap: ["bootstrap", "react-bootstrap"],
  fontawesome: [
    "@fortawesome/fontawesome-svg-core",
    "@fortawesome/free-solid-svg-icons",
    "@fortawesome/react-fontawesome",
  ],
};
mustInstallPackages.push(...packages.react);
var saveAsTemplate = false;
const checkInternetConnected = require("check-internet-connected");
const templatesArray = [];
templates.map((template) => {
  templatesArray.push(template.name);
});
// check internet connection

// LOGO
clear();

console.log("\n");
console.log(chalk.green(figlet.textSync("React New App", { horizontalLayout: "full" })));
console.log("\n");
var templateWillBe = true;
var selected_template = "";
async function promptForTemplate(options) {
  const defaultTemplate = "No";
  const questions = [];
  if (templates.length > 0) {
    questions.push({
      type: "list",
      name: "template",
      message: "Do you want to use template if not no select one from above.",
      choices: ["No", new inquirer.Separator()].concat(templatesArray),
      default: defaultTemplate,
    });
  } else {
    return;
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
  };
}

export async function cli_template(args) {
  let options = await promptForTemplate(args);
  if (options) {
    selected_template = options.template;
  }
  if ((options && options.template === "No") || templates.length === 0) {
    templateWillBe = false;
  }
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "JavaScript";
  const defaultBase = "Function";
  var noTemplate = true;
  const questions = [];
  const autoFix = (string) => {
    string = string.trim();
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
  if (templateWillBe === false || templates.length === 0) {
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
    questions.push({
      type: "list",
      name: "save",
      message: "Select yes if you want to save your template. ( Template name will ask when finish )",
      choices: ["Yes", "No"], // will add TS later
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    base: options.base || answers.base,
    redux: options.redux || answers.redux,
    options: options.options || answers.options,
    template: options.use_template || answers.use_template,
    save: options.save || answers.save,
  };
}
let new_template;

export async function cli(args) {
  let options;
  options = await promptForMissingOptions(args);
  if (options.save === "Yes") {
    saveAsTemplate = true;
  }
  new_template = options;
  var project_name = options.project_name;
  if (templateWillBe === true && templates.length > 0) {
    options = templates.find((temp) => temp.name === selected_template);
    options.project_name = project_name;
    new_template = options;
  }
  if (options.options.includes("Redux".toLowerCase())) {
    mustInstallPackages.push(...packages.redux);
  }
  if (options.options.includes("Sass".toLowerCase())) {
    mustInstallPackages.push(...packages.sass);
  }
  if (options.options.includes("React-Router".toLowerCase())) {
    mustInstallPackages.push(...packages.router);
  }
  if (options.options.includes("bootstrap")) {
    mustInstallPackages.push(...packages.bootstrap);
  }
  if (options.options.includes("font awesome 5")) {
    mustInstallPackages.push(...packages.fontawesome);
  }

  const testConnection = new Listr([
    {
      title: "Checking internet connection",
      task: () => {
        checkInternetConnected()
          .then((res) => {
            console.log("internet connection stable.");
          })
          .catch((ex) => {
            console.log(chalk.red("\nNo internet connection. Please turn on your internet.\n"));
            console.log(chalk.green("\nDo not worry your settings saved as <no internet> :D.\n"));

            process.exit();
          });
      },
    },
  ]);
  await testConnection.run().catch((err) => console.log(err));
  const testYarn = new Listr([
    {
      title: "Testing for yarn",
      task: (ctx, task) =>
        execa("yarn").catch(() => {
          ctx.yarn = false;
          task.skip("Yarn is not installed. Installing now");
        }),
    },
    {
      title: "Installing Yarn",
      enabled: (ctx) => ctx.yarn === false,
      task: () => execa("npm", ["install", "yarn", "-g"]),
    },
  ]);
  testYarn.run().catch((err) => console.log(err));
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
            {
              title: "Creating react_new_app.config.json",
              task: async () => createReactNewAppConfigJSON(options, installedVersion),
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

  console.log(chalk.yellow("\nThank you for used react-new"));
  console.log(chalk.green("\nRecommended"));
  console.log(`cd ${options.project_name}`);
  console.log(`npm start\n`);
  if (options.options.includes("sass")) {
    console.log(chalk.red("\nFor sass ==>"));
    console.log("cd src");
    console.log(`gulp\n`);
  }
  console.log("Thank You For used React New");
  if (!Latest) {
    console.log(chalk.yellow("\n\nThere is new version of react-new-app"));
    console.log("\n" + installedVersion + " --> " + latestVersion);
    console.log("Please update with -> " + "npm " + chalk.red("update ") + "react-new-app -g");
  }

  // execCommands("npm init -y");
}

async function promptForTemplateName(options) {
  const defaultName = "my_template";
  const questions = [];
  if (templateWillBe === false && saveAsTemplate === true) {
    questions.push({
      type: "input",
      name: "template_name",
      message: "Please enter your template name",
      default: defaultName,
      validate: (value) => {
        var temp_names = [];
        templates.map((temp) => {
          temp_names.push(temp.name);
        });
        if (temp_names.includes(value)) {
          return "There are already named template : " + value;
        }
        return true;
      },
    });
  }
  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    name: options.template_name || answers.template_name,
  };
}

export async function save_as_template(args) {
  if (templateWillBe === false && saveAsTemplate === true) {
    let options = await promptForTemplateName(args);
    new_template.name = options.name;
    const templateNameTask = new Listr([
      {
        title: "Adding Template",
        task: () => addTemplate(new_template),
      },
    ]);
    await templateNameTask.run().catch((err) => {
      console.log(err);
    });
  }
}
