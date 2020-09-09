// Imports

import fs from "fs";
import path from "path";

// Variables

const cb = (err, file_folder_name) => {
  if (err) {
    return console.log(err);
  }
  console.log(`creating : ${file_folder_name}`);
};
// Functions
const createPureReact = async (options) => {
  let src = options.project_name + "/src";
  let publicDir = options.project_name + "/public";
  let commandDir = process.cwd();
  let based = options.base === "Function" ? "func" : "class";
  let redux = options.redux === "Yes" ? true : false;
  fs.mkdirSync(path.join(commandDir, options.project_name));
  fs.mkdirSync(path.join(commandDir, src));
  fs.mkdirSync(path.join(commandDir, publicDir));

  var pureReactBoilerPlate_Function = fs.readFileSync(
    path.join(__dirname, `../boilerplates/${based === "func" ? "purereact_function.js" : "purereact_class.js"}`)
  );
  var indexBoilerPlate = fs.readFileSync(
    path.join(__dirname, `../boilerplates/${redux ? "index_redux.js" : "index_wo_redux.js"}`)
  );
  fs.writeFileSync(path.join(process.cwd(), `/${src}/index.js`), indexBoilerPlate, cb("index.js"));
  fs.writeFileSync(path.join(process.cwd(), `/${src}/app.js`), pureReactBoilerPlate_Function, cb("app.js"));
};

export default createPureReact;
