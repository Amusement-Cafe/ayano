const Eris              = require('eris')
const { withConfig }    = require('../core/with')
const { cmd }           = require('../core/cmd')

const startbot = async(ctx, argv) => {
    ctx.bot = new Eris(ctx.config.ayanobot.token)

    /* events */
    ctx.bot.on('ready', async event => {
        ctx.info('AyanoBOT connected and ready')
        await ctx.bot.editStatus('online', { name: 'over you', type: 3})
    })

    await ctx.bot.connect()

    ctx.keepalive = true
    return ctx
}

const quit = async(ctx) => {
    
}

cmd(['watch'], withConfig(startbot))
