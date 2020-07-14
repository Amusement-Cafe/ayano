/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/
 
const { cmd }   = require('../core/cmd')
const events    = require('../core/events')
const reload    = require('require-reload')(require)

const { 
    withConfig, 
    withData, 
    withCLI 
}  = require('../core/with')

var instance, connected, amusement

const create = async (ctx) => {

    amusement = reload('amusementclub2.0')
    ctx.allowExit = false
    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.create(options)

    instance.emitter.on('info', ctx.info)
    instance.emitter.on('error', ctx.error)

    events.on('quit', () => disconnect(ctx))
    events.on('colupdate', (data) => instance.updateCols(data))
    events.on('cardupdate', (data) => instance.updateCards(data))
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

const restart = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)
    
    await disconnect(ctx)
    instance = null
    reload.emptyCache(amusement)

    await startBot(ctx)
    await ctx.info(`Restarted **Amusement bot**`)
}

const reconnect = async (ctx) => {
    await disconnect(ctx)
    await startBot(ctx)
    await ctx.info(`Restarted Amusement bot connection to Discord`)
}

cmd(['start'], withCLI(withConfig(withData(startBot))))
cmd(['stop'], disconnect)
cmd(['restart'], restart)
cmd(['reconnect'], reconnect)
