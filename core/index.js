const { trigger } = require('./cmd')

const path = require('path')
const commandLineArgs = require('command-line-args')

const paths = {
    dataPath: path.resolve(path.join(__dirname, '..', 'data')),
    configPath: path.resolve(path.join(__dirname, '..', 'config')),
}

module.exports = (ctx, argv) => {
    try {
        const isolatedCtx = Object.assign({}, ctx, paths)
        const mainOptions = commandLineArgs(
            [{ name: 'command', defaultOption: true }], { argv, stopAtFirstUnknown: true })

        if(!mainOptions.command)
            return { keepalive: true }

        trigger(isolatedCtx, mainOptions)

    } catch(e) {
        ctx.error(e)
    }
}
