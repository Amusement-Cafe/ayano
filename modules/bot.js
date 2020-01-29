const Eris              = require('eris')
const { withConfig }    = require('../core/with')
const { cmd }           = require('../core/cmd')

var bot

const startbot = async(ctx, argv) => {
    bot = new Eris(ctx.config.ayanobot.token)

    /* events */
    bot.on('ready', async event => {
        ctx.info('AyanoBOT connected and ready')
        await bot.editStatus('online', { name: 'over you', type: 3})
    })

    await bot.connect()

    ctx.keepalive = true
    return ctx
}

const quit = async(ctx) => {
    if(bot){
        ctx.info('Waiting for AyanoBOT to disconnect...')
        await bot.disconnect()
    } 
}

cmd(['watch'], withConfig(startbot))
cmd(['quit'], quit)
