/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement                 = require('amusementclub2.0')
const { cmd }                   = require('../core/cmd')
const { withConfig, withData }  = require('../core/with')
const events                    = require('../core/events')

var instance, connected

const create = async (ctx) => {

    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.create(options)

    instance.emitter.on('info', ctx.info)
    instance.emitter.on('error', ctx.error)

    events.on('quit', () => disconnect(ctx))
}

const startBot = async (ctx, argv) => {
    if(connected)
        return await ctx.error(`Amusement bot is already running`)
    
    if(!instance) await create(ctx)

    await instance.connect()
    connected = true
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`Amusement bot is not running`)

    await instance.disconnect()
    await ctx.warn(`Amusement bot was disconnected`)
    connected = false
}

cmd(['start'], withConfig(withData(startBot)))
cmd(['stop'], disconnect)
