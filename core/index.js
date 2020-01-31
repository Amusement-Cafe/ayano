const { trigger } = require('./cmd')
const events = require('./events')

const path = require('path')
const commandLineArgs = require('command-line-args')
require('../modules')

const ctx = {
    events,

    dataPath: path.resolve(path.join(__dirname, '..', 'data')),
    configPath: path.resolve(path.join(__dirname, '..', 'config')),

    info: (msg, shard) => events.emit('info', msg, shard),
    warn: (msg, shard) => events.emit('warn', msg, shard),
    error: (msg, shard) => events.emit('error', msg, shard),

    allowExit: true,

    input: async (argv) => {
        try {
            const mainOptions = commandLineArgs(
                [{ name: 'command', defaultOption: true }], { argv, stopAtFirstUnknown: true })

            mainOptions.command = mainOptions.command || 'default'

            await trigger(ctx, mainOptions)

            if(ctx.allowExit) process.exit(0)
        } catch(e) {
            ctx.error(e)
            if(ctx.allowExit) process.exit(1)
        }
    }
}

ctx.events.on('info', (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
ctx.events.on('warn', (msg, shard) => console.log(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
ctx.events.on('error', (msg, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, msg))

module.exports = ctx
