import path from "path";
import dotenv from 'dotenv';
dotenv.config(path.resolve("./.env"));
import mysql from "mysql2";
import mysqldump from 'mysqldump';
import Importer from 'mysql-import';
import stater from "./stater.js";
import ora from 'ora';
import fs from 'fs';
import chalk from 'chalk';
import splitFile from 'split-file';

class MysqlConnector {
    constructor() {
        this.host = process.env.DB_HOST;
        this.user = process.env.DB_USER;
        this.password = process.env.DB_PASS;
        this.database = process.env.DB_DATABASE;
    }

    checkConnection() {
        return new Promise(resolve => {
            const connection = mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            })
            connection.connect(err => {
                if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }

    secondsToMinutes(seconds) {
        let minutes = 0
        if (seconds >= 60) {
            minutes = Math.floor(seconds / 60)
        }
        return `${String(minutes).length < 2 ? "0" + minutes : minutes}:${String((seconds - (minutes * 60))).length < 2 ? "0" + (seconds - (minutes * 60)) : seconds}`
    }

    async createState(name) {
        if (!(await this.checkConnection())) {
            console.log("The connection to the db could not be established !")
            process.exit(1)
        }

        const fileName = "./states/" + new Date().getTime() + ".sql"

        const spinner = ora(`Dumping ${process.env.DB_DATABASE} database..`).start()
        const startDate = Math.floor(new Date().getTime() / 1000)

        try {
            await mysqldump({
                connection: {
                    host: this.host,
                    user: this.user,
                    password: this.password,
                    database: this.database
                },
                dumpToFile: fileName
            })

            const data = fs.readFileSync(fileName); //read existing contents into data
            const fd = fs.openSync(fileName, 'w+');

            fs.writeSync(fd, `DROP DATABASE IF EXISTS ${this.database};\n\nCREATE DATABASE ${this.database};\n\nUSE ${this.database};\n\n`); //write new data
            fs.appendFile(fd, data, (err) => {
                if (err) {
                    console.log("ERR :", err)
                }
            });
            fs.close(fd, (err) => {
                if (err) {
                    console.log("ERR :", err)
                }
            });

            spinner.stop()
            const stopDate = Math.floor(new Date().getTime() / 1000)

            console.log(chalk.bold.green(`Db ${this.database} dumped in ${this.secondsToMinutes(stopDate - startDate)} !`))
            stater.createState({ name: name, filename: fileName })
        } catch (error) {
            if (spinner.isSpinning) {
                spinner.stop()
            }
            console.log(chalk.bold.red("\nError while dumping, complete stack here :\n\n") + error)
        }
    }

    async restoreState(filename) {
        const importer = new Importer({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        })
        const spinner = ora(`Restore ${process.env.DB_DATABASE} database..`).start()
        const startDate = Math.floor(new Date().getTime() / 1000)

        importer.import(filename)

        spinner.stop()
        const stopDate = Math.floor(new Date().getTime() / 1000)

        console.log(`Db ${this.database} restored in ${this.secondsToMinutes(stopDate - startDate)}`)
    }

}

export default MysqlConnector