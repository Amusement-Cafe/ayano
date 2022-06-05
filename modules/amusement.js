/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/
 
const { cmd, pcmd }   = require('../core/cmd')
const events          = require('../core/events')

const { 
    withConfig, 
    withData, 
    withCLI 
}  = require('../core/with')

var instance, connected, amusement

const create = async (ctx) => {

    amusement = require('amusementclub2.0')
    ctx.allowExit = false
    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.create(options)

    instance.emitter.on('info', (msg, title) => ctx.info(`[Amusement] ${msg}`, title))
    instance.emitter.on('error', ctx.error)

    events.on('quit', () => disconnect(ctx))
    events.on('colupdate', (data) => instance.updateCols(data))
    events.on('cardupdate', (data) => instance.updateCards(data))
    events.on('promoupdate', (data) => instance.updatePromos(data))
    events.on('boostupdate', (data) => instance.updateBoosts(data))
    events.on('wordsupdate', (data) => instance.updateWords(data))
}

const startBot = async (ctx) => {
    if(connected)
        return await ctx.error(`**Amusement bot** is already running`)
    
    if(!instance) await create(ctx)

    await instance.connect()
    connected = true
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await instance.disconnect()
    await ctx.warn(`**Amusement bot** was disconnected`)
    connected = false
}

const delay = time => new Promise(res=>setTimeout(res,time));

const reconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await disconnect(ctx)
    await startBot(ctx)
    await ctx.info(`Restarted Amusement bot connection to Discord`)
}

pcmd(['admin'],['start'], withCLI(withConfig(withData(startBot))))
pcmd(['admin'],['stop'], disconnect)
pcmd(['admin'],['reconnect'], reconnect)
