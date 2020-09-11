var shell = require("shelljs");
import fs from "fs";
import path from "path";
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

export function createReactNewAppConfigJSON(options, installedVersion) {
  let optArr = [];
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

export default execCommands;
