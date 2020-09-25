import inquirer from "inquirer";
const path = require("path");
import clear from "clear";
import fs from "fs";
import Listr from "listr";

const checkIsItRnaAPP = () => {
  if (fs.readdirSync(process.cwd()).indexOf("rna.config.json") < 0) {
    console.log("rna.config.json has been found.");
  }
};

const tasks = new Listr([
  {
    title: "Starting from scratch",
    task: () =>
      new Listr([
        {
          title: "Checking rna.config.json",
          task: () => {},
        },
      ]),
  },
]);

tasks.run().catch((err) => {
  console.log(err);
});
