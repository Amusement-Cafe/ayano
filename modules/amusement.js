/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement                 = require('amusementclub2.0')
const { cmd }                   = require('../core/cmd')
const { withConfig, withData }  = require('../core/with')
const events                    = require('../core/events')

var instance, connected

const startBot = async (ctx, argv) => {
    if(connected)
        return await ctx.error(`Amusement bot is already running`)
    
    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.start(options)

    instance.emitter.on('info', ctx.info)
    instance.emitter.on('error', ctx.error)

    ctx.amusement = instance.bot
    connected = true

    events.on('quit', async () => disconnect(ctx))
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`Amusement bot is not running`)

    await instance.bot.disconnect({reconnect:false})
    await ctx.warn(`Amusement bot was disconnected`)
    connected = false
}

cmd(['start'], withConfig(withData(startBot)))
cmd(['stop'], disconnect)
