import fs from "fs"

class Stater {
    constructor() {
        if (!fs.existsSync("./config.json")) {
            console.log("Create config.json")
            fs.writeFileSync("./config.json", JSON.stringify([]))
        }

        if (!fs.existsSync("./states")) {
            console.log("'states' folder not locate, create the 'states' folder")
            fs.mkdirSync("./states")
        }

        const childs = fs.readdirSync("./states")
        console.log(`'states' folder found ! ${childs.length} states loaded`)

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
        return twoDigits(dateNeedTransform.getHours()) + ":" + twoDigits(dateNeedTransform.getMinutes()) + ":" + twoDigits(dateNeedTransform.getSeconds()) + "-" + twoDigits(dateNeedTransform.getDay()) + "/" + twoDigits(dateNeedTransform.getMonth()) + "/" + dateNeedTransform.getFullYear()
    }

    saveState() {
        fs.writeFileSync("./config.json", JSON.stringify(this.state))
        process.exit(0)
    }

    createState({ name, filename }) {
        this.state.push({
            name: name,
            filename: filename + ".sql",
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