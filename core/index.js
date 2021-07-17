const { trigger } = require('./cmd')
const events = require('./events')

const path = require('path')
const commandLineArgs = require('command-line-args')
require('../modules')

const ctx = {
    events,

    dataPath: path.resolve(path.join(__dirname, '..', 'data')),
    configPath: path.resolve(path.join(__dirname, '..', 'config')),

    info: (msg, title) => events.emit('info', msg, title),
    warn: (msg, title) => events.emit('warn', msg, title),
    error: (msg, title) => events.emit('error', msg, title),

    allowExit: true,

    input: async (argv, type) => {
        try {
            /*const mainOptions = commandLineArgs(
                [{ name: 'command', defaultOption: true }], { argv, stopAtFirstUnknown: true })

            mainOptions.command = mainOptions.command || 'default'*/

            argv = argv.filter(n => n)
            await trigger(ctx, argv, type)

            if(ctx.allowExit) process.exit(0)
        } catch(e) {
            ctx.error(e)
            if(ctx.allowExit) process.exit(1)
        }
    }
}

ctx.events.on('info', (msg, title = "") => console.log(`[INFO] ${title}: ${msg}`))
ctx.events.on('warn', (msg, title = "") => console.log(`[WARN] ${title}: ${msg}`))
ctx.events.on('error', (msg) => console.error(`[ERR]`, msg))

module.exports = ctx
