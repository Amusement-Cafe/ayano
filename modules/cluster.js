/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const amusement                 = require('amusementclub2.0')
//const userq = require('amusementclub2.0/userq')
const _                         = require('lodash')
const { cmd }                   = require('../core/cmd')
const { withConfig, withData }  = require('../core/with')

const userq = []

const startBot = async (ctx, argv) => {
    
    ctx.shards = []
    for(let i=0; i<ctx.config.shards; i++) {
        
        const options  = Object.assign({shard: i, data: ctx.data}, ctx.config.shard)
        const instance = await amusement.start(options)

        instance.on('info', msg => ctx.info(msg, i))
        instance.on('error', err => ctx.error(err, i))

        ctx.shards.push(instance)
    }

    setInterval(tick.bind(this), ctx.config.tick)

    ctx.keepalive = true
    return ctx
}

const tick = () => {
    const now = new Date()
    _.remove(userq, (x) => x.expires < now)
}

cmd(['start'], withConfig(withData(startBot)))
