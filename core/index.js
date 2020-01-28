const { trigger } = require('./cmd')
const modules = require('../modules')

const commandLineArgs = require('command-line-args')

const paths = {
    dataPath: '../data',
    configPath: '/config',
}

module.exports = (ctx, argv) => {
    try {
        const isolatedCtx = Object.assign({}, ctx, paths)
        const mainOptions = commandLineArgs(
            [{ name: 'command', defaultOption: true }], { argv, stopAtFirstUnknown: true })

        return trigger(isolatedCtx, mainOptions)

    } catch(e) {
        return ctx.error(e)
    }
}
