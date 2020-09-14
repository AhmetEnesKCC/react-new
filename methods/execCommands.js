var shell = require("shelljs");
import fs from "fs";
import path from "path";
import templateJson from "../templates.json";
import execa from "execa";
function execCommands(command) {
  shell.exec(command);
}

export function createNpmFile(options, mustInstallPackages) {
  fs.writeFileSync(
    path.join(process.cwd(), options.project_name, "package.json"),
    `{"name": "${options.project_name}",
      "version": "1.0.0",
      "description": "",
      "main": "src/index.js",
      "scripts": {
        "test": "react-scripts test",
        "start" : "react-scripts start",
        "build" : "react-scripts build",
        "eject" : "react-scripts eject"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": { 
      },"browserslist": {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }}`
  );
}

export function createManifestJson(options) {
  fs.writeFileSync(
    path.join(process.cwd(), options.project_name, "public", "manifest.json"),
    `{
    "short_name": "${options.project_name}",
    "name": "React App made with react-new",
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff"
  }
  `
  );
}

export async function createReactNewAppConfigJSON(options) {
  let optArr = [];
  let installedVersion;
  await execa("npm", ["list", "react-new-app", "-g"]).then((result) => {
    if (result.stdout !== "") {
      var index = result.stdout.indexOf("react-new-app");
      installedVersion = result.stdout.slice(index + 14, index + 19);
    }
  });
  options.options.map((opt) => {
    optArr.push(`"${opt}"`);
  });
  fs.writeFileSync(
    path.join(process.cwd(), options.project_name, "react_new_app.config.json"),
    `
  {
    "name": "${options.project_name}",
    "varsion": "${installedVersion}",
    "selected_packages": [${optArr}],
    "official": "true"
  }
  `
  );
}

export function addTemplate(options) {
  let optArr = [];
  let tempArr = [];

  templateJson.map((temp) => {
    let tempOptions = [];
    temp.options.map((opt) => {
      tempOptions.push(`"${opt}"`);
    });
    tempArr.push(`{"name" : "${temp.name}", "base" : "${temp.base}", "options" : [${tempOptions}] }`);
  });
  options.options.map((opt) => {
    optArr.push(`"${opt}"`);
  });
  var templateString = `{"name" : "${options.name}","base" : "${options.base}", "options" : [${optArr}]}`;
  tempArr.push(templateString);
  var allTemplates = `[${tempArr}]`;
  fs.writeFileSync(path.join(__dirname, "../templates.json"), allTemplates);
}

export default execCommands;
