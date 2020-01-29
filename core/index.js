const { trigger } = require('./cmd')
const events = require('./events')

const path = require('path')
const commandLineArgs = require('command-line-args')

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

            if(!mainOptions.command)
                return { keepalive: true }

            trigger(ctx, mainOptions)

        } catch(e) {
            ctx.error(e)
        }
    }
}

const modules = require('./modules')(ctx)

module.exports = ctx
