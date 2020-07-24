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

    for(let i = 0, ln = cards.length; i < ln; i++) {
        cards[i].id = i
    }

    ctx.data = { 
        cards, collections, bannedwords, 
        promos: promos.map(x => Object.assign({}, x, {
            starts: Date.parse(x.starts),
            expires: Date.parse(x.expires)
        })),
        boosts: boosts.map(
            x => Object.assign({}, x, {
            starts: Date.parse(x.starts),
            expires: Date.parse(x.expires)
        }))
    }

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
    ctx.info(`Successfully connected to database`)

    return callback(ctx, ...args)
}

const withS3 = callback => async (ctx, ...args) => {
    if(!ctx.config)
        return ctx.error(`Config is required to establish connection to spaces`)

    if(ctx.s3)
        return callback(ctx, ...args)

    ctx.info(`Connecting to spaces`)
    const AWS = require('aws-sdk')
    const conf = ctx.config.aws
    const endpoint = new AWS.Endpoint(conf.endpoint)
    ctx.s3 = new AWS.S3({
        endpoint, 
        accessKeyId: conf.s3accessKeyId, 
        secretAccessKey: conf.s3secretAccessKey
    })
    ctx.info(`Successfully connected to spaces`)

    return callback(ctx, ...args)
}

const withCLI = callback => async (ctx, ...args) => {
    if(!ctx.allowExit)
        createInterface(ctx)

    return callback(ctx, ...args)
}

module.exports = { withConfig, withData, withDB, withCLI, withS3 }