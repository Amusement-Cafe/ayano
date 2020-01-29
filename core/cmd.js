const tree = {}

const cmd = (aliases, callback) => {
    const cursor = tree

    aliases.map(alias => {
        if (!cursor.hasOwnProperty(alias)) {
            cursor[alias] = { _callbacks: [] }
        }

        cursor[alias]._callbacks.push(callback)
    })
}

const trigger = (ctx, argv) => {
    const command = argv.command
    if (!tree.hasOwnProperty(command)) 
        return ctx.error(`Unknown command '${command}'`)

    return Promise.all(tree[command]._callbacks.map(x => x.apply({}, [ctx, argv._unknown])))
}

module.exports = { cmd, trigger }
