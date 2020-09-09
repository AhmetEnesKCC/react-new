var shell = require("shelljs");

function execCommands(command) {
  shell.exec(command);
}

export default execCommands;
