const { 
    requireOrDefault,
    readOrDefault,
} = require('./utils')
const { createInterface }   = require('../modules/cli')
const MongoClient           = require('mongodb').MongoClient;

const withConfig = callback => (ctx, ...args) => {
    if(ctx.config)
        return callback(ctx, ...args)

    ctx.info(`Getting config on path '${ctx.configPath}'`)
    const cfg = requireOrDefault(`${ctx.configPath}`)

    if(!cfg || !cfg.amusement)
        return ctx.error(`Config not found`)

    ctx.config = cfg
    ctx.config.amusement.bot.database = cfg.database

    return callback(ctx, ...args)
}

const withData = callback => (ctx, ...args) => {
    if(ctx.data)
        return callback(ctx, ...args)

    ctx.info(`Performing data check on path '${ctx.dataPath}'`)
    const cards = readOrDefault(`${ctx.dataPath}/cards`)
    const collections = readOrDefault(`${ctx.dataPath}/collections`)

    if(!cards || !collections)
        return ctx.error(`Cards and collections are required to start a cluster.
            Please make sure you run [ayy update] first to get the data`)

    const bannedwords = readOrDefault(`${ctx.dataPath}/bannedwords`, [])
    const promos = readOrDefault(`${ctx.dataPath}/promos`, [])
    const boosts = readOrDefault(`${ctx.dataPath}/boosts`, [])

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

    if(ctx.db)
        return callback(ctx, ...args)

    ctx.info(`Connecting to database`)
    const mongoUri = ctx.config.database
    const mongoOpt = {useNewUrlParser: true, useUnifiedTopology: true}

    ctx.db = (await MongoClient.connect(mongoUri, mongoOpt)).db('amusement2')
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
        secretAccessKey: conf.s3secretAccessKey,
        signatureVersion: conf.signatureVersion,
        s3ForcePathStyle: conf.s3ForcePathStyle
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
