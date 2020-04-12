const tree = {}

const cmd = (...args) => buildTree(args)

const buildTree = (args) => {
    const callback = args.pop()
    const cursors = []

    args.map(alias => {
        let sequence = Array.isArray(alias) ? alias : [alias]
        let cursor = tree

        sequence.map(arg => {
            if (!cursor.hasOwnProperty(arg)) {
                cursor[arg] = {}
            }

            cursor = cursor[arg]
        })

        cursor._callback = callback
        cursors.push(cursor)
    })
}

const trigger = (ctx, args) => {
    let cursor = tree

    if(args.length === 0)
        args.push('default')

    while (cursor.hasOwnProperty(args[0])) {
        cursor = cursor[args[0]]
        args.shift()
    }

    if (!cursor.hasOwnProperty('_callback')) {
        return ctx.error(`Unknown command tree '${args.join(' ')}'`)
    }

    return cursor._callback.apply({}, [ctx].concat(args))
}

module.exports = { cmd, trigger }
