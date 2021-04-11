import mysqlConnector from "./mysqlConnector.js";
import inquirer from "inquirer";
import stater from "./stater.js";
const prompt = inquirer.createPromptModule();
const mysqlConnection = new mysqlConnector();

prompt({
    type: "list",
    name: "choice",
    message: "What you want to do ?",
    choices: [{ name: "Save the actual state of my db", value: "save" }, { name: "Restore a save state of the db", value: "restore" }, { name: "Quit this script", value: "quit" }]
}).then(answers => {
    switch (answers.choice) {
        case "save":
            prompt({ type: "input", name: "name", message: "Please enter a name for this state" }).then(answers => {
                mysqlConnection.createState(answers.name)
            })
            break;
        case "restore":
            prompt({ type: "list", name: "state", message: "Which state would you restore ?", choices: stater.getAllStates() }).then(answers => {
                mysqlConnection.restoreState(answers.state)
            })
            break;
        case "quit":
            console.log("See ya bro <3 !")
            process.exit(0);
            break;
    }
})