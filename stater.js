import fs from "fs";
import chalk from "chalk";

class Stater {
    constructor() {
        console.log("\nWelcome to MySQL Stater    -by unkobweb")

        if (!fs.existsSync("./config.json")) {
            console.log("Create config.json")
            fs.writeFileSync("./config.json", JSON.stringify([]))
        }

        if (!fs.existsSync("./states")) {
            console.log("'states' folder not locate, create the 'states' folder")
            fs.mkdirSync("./states")
        }

        const childs = fs.readdirSync("./states")
        console.log(`\n${childs.length == 0 ? chalk.red("No state found") : chalk.yellow(childs.length) + " states loaded !"}\n`)

        this.state = JSON.parse(fs.readFileSync("./config.json", 'utf-8'))
    }

    parseDate(date) {
        function twoDigits(number) {
            if (String(number).length < 2) {
                return "0" + number
            }
            return number
        }
        const dateNeedTransform = new Date(date)
        return twoDigits(dateNeedTransform.getHours()) + ":" + twoDigits(dateNeedTransform.getMinutes()) + ":" + twoDigits(dateNeedTransform.getSeconds()) + "-" + twoDigits(dateNeedTransform.getDate()) + "/" + twoDigits(dateNeedTransform.getMonth() + 1) + "/" + dateNeedTransform.getFullYear()
    }

    saveState() {
        fs.writeFileSync("./config.json", JSON.stringify(this.state))
        process.exit(0)
    }

    createState({ name, filename }) {
        this.state.push({
            name: name,
            filename: filename,
            createdAt: new Date()
        })
        this.saveState()
    }

    getAllStates() {
        if (this.state.length == 0) {
            console.log("For the moment there is no state saved")
            return
        }
        const maxLength = this.state.map(state => state.name).sort((a, b) => b.length - a.length)[0].length
        function equalLength(name, length) {
            while (name.length !== length) {
                name += " "
            }
            return name
        }
        return this.state.map(state => {
            return { name: `${equalLength(state.name, maxLength)} - ${this.parseDate(state.createdAt)}`, value: state.filename }
        })
    }
}

const instance = new Stater()

export default instance