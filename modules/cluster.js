/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement = require('amusementclub2.0')
//const userq = require('amusementclub2.0/userq')
const userq = []
const _ = require('lodash')
const { cmd } = require('../core/cmd')
const { requireOrDefault } = require('../core/utils')

const startBot = async (ctx, argv) => {
    
    for(let i=0; i<ctx.config.shards; i++) {
        
        const options  = Object.assign({shard: i, data: ctx.data}, ctx.config.bot)
        const instance = await amusement.start(options)

        instance.on('info', msg => ctx.info(i, msg))
        instance.on('error', err => ctx.error(i, err))
    }

    setInterval(tick.bind(this), ctx.config.tick)
}

const withConfig = callback => (ctx) => {
    ctx.info(`Getting config on path '${ctx.configPath}'`)
    const cfg = requireOrDefault(`${ctx.configPath}`)

    if(!cfg || !cfg.bot)
        return ctx.error(`Config not found`)

    ctx.config = cfg

    return callback(ctx)
}

const withData = callback => (ctx) => {
    ctx.info(`Performing data check on path '${ctx.dataPath}'`)
    const cards = requireOrDefault(`${ctx.dataPath}/cards`)
    const collections = requireOrDefault(`${ctx.dataPath}/collections`)

    if(!cards || !collections)
        return ctx.error(`Cards and collections are required to start a cluster.
            Please make sure you run [ayy update] first to get the data`)

    const items = requireOrDefault(`${ctx.dataPath}/items`, [])
    const help = requireOrDefault(`${ctx.dataPath}/help`, [])
    const achievements = requireOrDefault(`${ctx.dataPath}/achievements`, [])

    if(items.length === 0 || help.length === 0)
        return ctx.warn(`Some data appears to be empty. Some bot functions will be limited`)

    ctx.data = { cards, collections, items, achievements, help }

    return callback(ctx)
}

const tick = () => {
    const now = new Date()
    _.remove(userq, (x) => x.expires < now)
}

cmd(['start'], withConfig(withData(startBot)))
