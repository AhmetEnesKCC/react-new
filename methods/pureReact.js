// Imports

import fs from "fs";
import path from "path";

// Variables

const cb = (err, file_folder_name) => {
  if (err) {
    return console.log(err);
  }
};
// Functions
const createPureReact = (options) => {
  let src = options.project_name + "/src";
  let publicDir = options.project_name + "/public";
  let commandDir = process.cwd();
  let based = options.base === "Function" ? "func" : "class";
  let redux = options.options.includes("Redux".toLowerCase()) ? true : false;
  let sass = options.options.includes("Sass".toLowerCase()) ? true : false;
  fs.mkdirSync(path.join(commandDir, options.project_name));
  fs.mkdirSync(path.join(commandDir, src));
  fs.mkdirSync(path.join(commandDir, publicDir));
  fs.mkdirSync(path.join(commandDir, src, "styles"));
  if (sass) {
    fs.mkdirSync(path.join(commandDir, src, "styles", "scss"));
  }
  fs.mkdirSync(path.join(commandDir, src, "styles", "css"));
  if (redux) {
    fs.mkdirSync(path.join(commandDir, src, "redux"));
  }

  var pureReactBoilerPlate_Function = fs.readFileSync(
    path.join(__dirname, `../boilerplates/${based === "func" ? "purereact_function.js" : "purereact_class.js"}`)
  );
  var indexBoilerPlate = fs.readFileSync(
    path.join(__dirname, `../boilerplates/${redux ? "index_redux.js" : "index_wo_redux.js"}`)
  );
  var htmlBoilerPlate = fs.readFileSync(path.join(__dirname, `../boilerplates/index.html`));
  var gulpFile = fs.readFileSync(path.join(__dirname, `../boilerplates/gulpFile.js`));
  var reduxReducers = fs.readFileSync(path.join(__dirname, "../boilerplates/reducers.js"));
  var cssFile = fs.readFileSync(path.join(__dirname, "../boilerplates/css_sass.css"));
  fs.writeFileSync(path.join(process.cwd(), `/${src}/index.js`), indexBoilerPlate);
  fs.writeFileSync(path.join(process.cwd(), `/${src}/app.js`), pureReactBoilerPlate_Function);
  fs.writeFileSync(path.join(process.cwd(), `/${publicDir}/index.html`), htmlBoilerPlate);
  fs.writeFileSync(path.join(process.cwd(), `/${src}/styles/css/main.css`), cssFile);

  if (sass) {
    fs.writeFileSync(path.join(process.cwd(), `/${src}/gulpFile.js`), gulpFile);
    fs.writeFileSync(path.join(process.cwd(), `/${src}/styles/scss/main.scss`), cssFile);
  }
  if (redux) {
    fs.writeFileSync(path.join(process.cwd(), `/${src}/redux/reducers.js`), reduxReducers);
  }
};

export default createPureReact;
