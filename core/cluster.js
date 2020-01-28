/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement = require('amusementclub2.0')
//const userq = require('amusementclub2.0/userq')
const userq = []
const _ = require('lodash')

const startBot = async (ctx) => {
    
    for(let i=0; i<ctx.config.shards; i++) {
        
        const options  = Object.assign({shard: i, data: ctx.data}, ctx.config.bot)
        const instance = await amusement.start(options)

        instance.on('info', msg => ctx.report(i, msg))
        instance.on('error', err => ctx.error(i, err))
    }

    setInterval(tick.bind(this), ctx.config.tick)
}

const withConfig = callback = (ctx) => {
    ctx.report(`Getting config on path '${ctx.configPath}'`)
    const cfg = require(`${ctx.configPath}`)

    if(!cfg || !cfg.bot)
        return ctx.error(`Config not found`)

    ctx.config = cfg

    return callback(ctx)
}

const withData = callback = (ctx) => {
    ctx.report(`Performing data check on path '${ctx.dataPath}'`)
    const cards = require(`${ctx.dataPath}/cards`)
    const collections = require(`${ctx.dataPath}/collections`)

    if(!cards || !collections)
        return ctx.error(`Cards and collections are required to start a cluster.
            Please make sure you run [ayy update] first to get the data`)

    const items = require(`${ctx.dataPath}/items`) || []
    const help = require(`${ctx.dataPath}/help`) || []
    const achievements = require(`${ctx.dataPath}/achievements`) || []

    if(items.length === 0 || help.length === 0)
        return ctx.warn(`Some data appears to be empty. Some bot functions will be limited`)

    ctx.data = { cards, collections, items, help }

    return callback(ctx)
}

const tick = () => {
    const now = new Date()
    _.remove(userq, (x) => x.expires < now)
}

module.exports = {
    //startBot: withConfig(withData(startBot))
}