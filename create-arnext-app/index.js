#!/usr/bin/env node
const util = require("node:util")
const exec = util.promisify(require("node:child_process").exec)
const { cpSync, existsSync } = require("fs")
const { resolve } = require("path")
const { isNil } = require("ramda")

const main = async () => {
  const appname = process.argv[2]
  if (isNil(appname)) return console.error("appname not specified")
  const appdir = resolve(process.cwd(), appname)
  if (existsSync(appdir)) return console.error(`appdir exists: ${appdir}`)
  const app = resolve(__dirname, "app")
  try {
    cpSync(app, appdir, { recursive: true })
    const { error, stdout, stderr } = await exec(
      `cd ${appdir} && yarn && rm -rf .weavedb && mkdir .weavedb`,
    )
    if (error) {
      console.error(`something went wrong...`)
    } else {
      console.log(`${appname} successfully created!`)
    }
  } catch (e) {
    console.error(e)
  }
}

main()
