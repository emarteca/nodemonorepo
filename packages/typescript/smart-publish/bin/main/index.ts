import process from 'process'
import path from 'path'
import semver from 'semver'
import chalk from 'chalk'
import createPrettyExec from 'pretty-exec'
import exec from 'exec-inline'
import { cmds, ExitStatusCode } from '../../index'

const {
  NPM = 'npm',
  CWD = process.cwd()
} = process.env

const argv = process.argv.slice(2)

if (argv.includes('help') || argv.includes('--help')) {
  help()
} else {
  main()
}

function main () {
  const error = (status: ExitStatusCode, text: string) => {
    console.error(`${chalk.red('[ERROR]')} ${ExitStatusCode[status]}: ${text}`)
    console.error(`Exiting with code ${status}`)
    process.exit(status)
  }

  const { Success, Private, MissingName, InvalidVersion } = ExitStatusCode
  const { private: prv, name, version } = require(path.resolve(CWD, 'package.json'))

  if (prv) return error(Private, 'Cannot publish a private package')
  if (!name) return error(MissingName, 'Missing "name" field in package.json')
  if (!version) return error(InvalidVersion, 'Missing "version" field in package.json')

  const validVersion = semver.valid(version)
  if (!validVersion) return error(InvalidVersion, `Invalid Syntax: ${JSON.stringify(version)}`)

  // Changing directory, so that npm is called in the right place
  process.chdir(CWD)

  const prettyExec = createPrettyExec({
    spawn: (cmd, args) => exec(cmd, ...args),
    print: console.info
  })

  console.info(`Working Directory: ${CWD}\n`)
  for (const command of cmds(name, validVersion)) {
    prettyExec(NPM, command).exit.onerror()
  }

  console.info('\ndone.')
  process.exit(Success)
}

function help () {
  const title = (text: string) => console.info('\n' + chalk.bold.underline(text + ':'))
  const line = (text: string) => console.info(`  ${text}`)
  const env = (name: string, usage: string) => line(`* ${chalk.bold(name + ':')} ${usage}`)

  title('Usage')
  line('$ smart-publish')

  title('Environment Variables')
  env('NPM', 'Program to call [default: "npm"]')
  env('CWD', 'Working directory [default: process.cwd()]')

  title('Exit Status Code')
  for (const [key, value] of Object.entries(ExitStatusCode)) {
    if (isFinite(key as any)) continue
    line(`${chalk.bold(String(value))} → ${key}`)
  }
}
