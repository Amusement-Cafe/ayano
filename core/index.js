const cluster = require('./cluster')
const commandLineArgs = require('command-line-args')

const paths = {
    dataPath: '../data',
    configPath: '/config',
}

module.exports = (ctx, args) => {
    const isolatedCtx = Object.assign({}, ctx, paths)
    const mainOptions = commandLineArgs(
        [{ name: 'command', defaultOption: true }], { stopAtFirstUnknown: true })

    const argv = mainOptions._unknown || []

    console.log(mainOptions)
    console.log(isolatedCtx)
}
