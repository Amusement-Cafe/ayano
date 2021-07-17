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

const trigger = (ctx, args, type) => {
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

    if (cursor._perm) {
        if(!type || !cursor._perm.find(x => x === type))
            return ctx.error(`Only users with ayano roles **[${cursor._perm}]** can execute this command`)
    }

    return cursor._callback.apply({}, [ctx].concat(args))
}

module.exports = { cmd, pcmd, trigger }
