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

    input: (argv) => {
        try {
            const mainOptions = commandLineArgs(
                [{ name: 'command', defaultOption: true }], { argv, stopAtFirstUnknown: true })

            mainOptions.command = mainOptions.command || 'default'

            trigger(ctx, mainOptions)

        } catch(e) {
            ctx.error(e)
        }
    }
}

ctx.events.on('info', (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
ctx.events.on('warn', (msg, shard) => console.log(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
ctx.events.on('error', (msg, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, msg))

module.exports = ctx
