const tree = {}

const cmd = (aliases, callback) => {
    const cursor = tree

    aliases.map(alias => {
        if (!cursor.hasOwnProperty(alias)) {
            cursor[alias] = {}
        }

        cursor[alias]._callback = callback
    })
}

const trigger = (ctx, argv) => {
    const command = argv.command
    if (!tree.hasOwnProperty(command)) 
        return ctx.error(`Unknown command '${command}'`)

    return tree[command]._callback.apply({}, [ctx, argv._unknown])
}

module.exports = { cmd, trigger }
