const { requireOrDefault }  = require('./utils')
const { createInterface }   = require('../modules/cli')

const withConfig = callback => (ctx, ...args) => {
    if(ctx.config)
        return callback(ctx, ...args)

    ctx.info(`Getting config on path '${ctx.configPath}'`)
    const cfg = requireOrDefault(`${ctx.configPath}`)

    if(!cfg || !cfg.shard)
        return ctx.error(`Config not found`)

    ctx.config = cfg
    ctx.config.shard.database = cfg.database

    return callback(ctx, ...args)
}

const withData = callback => (ctx, ...args) => {
    if(ctx.data)
        return callback(ctx, ...args)

    ctx.info(`Performing data check on path '${ctx.dataPath}'`)
    const cards = requireOrDefault(`${ctx.dataPath}/cards`)
    const collections = requireOrDefault(`${ctx.dataPath}/collections`)

    if(!cards || !collections)
        return ctx.error(`Cards and collections are required to start a cluster.
            Please make sure you run [ayy update] first to get the data`)

    const bannedwords = []
    const promos = requireOrDefault(`${ctx.dataPath}/promos`, [])
    const boosts = requireOrDefault(`${ctx.dataPath}/boosts`, [])

    ctx.data = { cards, collections, bannedwords, promos, boosts }

    return callback(ctx, ...args)
}

const withDB = callback => async (ctx, ...args) => {
    if(!ctx.config)
        return ctx.error(`Config is required to connect to database. Please provide config first`)

    if(ctx.mcn)
        return callback(ctx, ...args)

    ctx.info(`Connecting to database`)
    const mongoUri = ctx.config.database
    const mongoOpt = {useNewUrlParser: true, useUnifiedTopology: true}

    ctx.mcn = await require('mongoose').connect(mongoUri, mongoOpt)
    ctx.info(`Successfully connected.`)

    return callback(ctx, ...args)
}

const withCLI = callback => async (ctx, ...args) => {
    if(!ctx.allowExit)
        createInterface(ctx)

    return callback(ctx, ...args)
}

module.exports = { withConfig, withData, withDB, withCLI }