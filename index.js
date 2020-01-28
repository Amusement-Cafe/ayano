
const cluster = require('./core/cluster')
const commandLineArgs = require('command-line-args')

const ctx = {
    dataPath: '../data',
    configPath: '/config',
}

const mainOptions = commandLineArgs(
    [{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true })

const argv = mainOptions._unknown || []

console.log('mainOptions\n===========')
console.log(mainOptions)



