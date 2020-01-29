/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement                 = require('amusementclub2.0')
const { cmd }                   = require('../core/cmd')
const { withConfig, withData }  = require('../core/with')

var instance

const startBot = async (ctx, argv) => {
    
    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.start(options)

    instance.emitter.on('info', ctx.info)
    instance.emitter.on('error', ctx.error)

    ctx.amusement = instance.bot

    ctx.keepalive = true
    return ctx
}

const stopBot = async (ctx, argv) => {
    if(!instance)
        return ctx.error(`Amusement bot is not running`)

    await instance.bot.disconnect()
}

const quit = async (ctx, argv) => {
    if(instance) {
        ctx.info('Safely disconnecting Amusement shards...')
        await instance.bot.disconnect()
    }
}

cmd(['start'], withConfig(withData(startBot)))
cmd(['stop'], stopBot)
cmd(['quit'], quit)
