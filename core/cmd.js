const tree = {}

const cmd = (...args) => buildTree(args)

const pcmd = (perm, ...args) => buildTree(args, perm)

const buildTree = (args, perm) => {
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

        if(perm)
            cursor._perm = perm

        cursors.push(cursor)
    })
}

const trigger = (ctx, args, roles, extra) => {
    let cursor = tree

    if(args.length === 0)
        args.push('default')

    while (cursor.hasOwnProperty(args[0])) {
        cursor = cursor[args[0]]
        args.shift()
        if (extra)
            extra.shift()
    }

    if (!cursor.hasOwnProperty('_callback')) {
        return ctx.error(`Unknown command tree '${args.join(' ')}'`)
    }

    if (cursor._perm) {
        if(!roles || !cursor._perm.find(x => roles.includes(x)))
            return ctx.error(`Only users with ayano roles **[${cursor._perm}]** can execute this command`)
    }
    const newArgs = [ctx, args || {}].concat(extra)

    return cursor._callback.apply({}, newArgs)
}

module.exports = { cmd, pcmd, trigger }
