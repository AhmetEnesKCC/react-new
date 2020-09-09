import chalk from "chalk";
import fs from "fs";
import ncp from "ncp";
import path from "path";
import { promisify } from "util";

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(options.templateDirtectory, options.targetDirectory, {
    clobber: false,
  });
}

export async function createProject() {
  options = {
    ...options,
  };
}
