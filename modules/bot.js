const Eris              = require('eris')
const { withConfig }    = require('../core/with')
const { cmd }           = require('../core/cmd')
const core              = require('../core')

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

var bot, replych

const startbot = async(ctx, argv) => {
    if(bot)
        return await ctx.error(`AyanoBOT is already running`)

    bot = new Eris(ctx.config.ayanobot.token)
    replych = ctx.config.ayanobot.reportchannel

    const prefix = ctx.config.ayanobot.prefix
    const send = (content, col) => bot.createMessage(replych, { embed: { description: content, color: col || colors.blue } })

    ctx.on('info', (msg, shard) => send(`${!isNaN(shard)? `[SH${shard}] `:''}${msg}`, colors.green))
    ctx.on('warn', (msg, shard) => send(`${!isNaN(shard)? `[SH${shard}] `:''}${msg}`, colors.yellow))
    ctx.on('error', (msg, shard) => send(`${!isNaN(shard)? `[SH${shard}] `:''}${msg}`, colors.red))

    /* events */
    bot.on('ready', async event => {
        ctx.info('AyanoBOT connected and ready')
        await bot.editStatus('online', { name: 'over you', type: 3})
    })

    bot.on('messageCreate', async (msg) => {
        if (!msg.content.startsWith(prefix)) return;
        if (msg.author.bot || !ctx.config.ayanobot.admins.includes(msg.author.id)) return;
        msg.content = msg.content.toLowerCase()

        try {
            const args = msg.content.trim().substring(prefix.length + 1).replace(/\s\s+/, ' ').split(/\s/)
            replych = msg.channel.id
            await core(ctx, args)
            replych = ctx.config.ayanobot.reportchannel
        } catch(e) {
            ctx.error(e)
        }
    })

    await bot.connect()

    ctx.keepalive = true
    return ctx
}

const stopBot = async (ctx) => {
    if(!bot)
        return await ctx.error(`AyanoBOT is not running`)

    await ctx.info('Bye!')
    await bot.disconnect()
    bot = null
}

const quit = async(ctx) => {
    if(bot){
        await ctx.info('Waiting for AyanoBOT to disconnect...')
        await bot.disconnect()
    } 
}

cmd(['watch'], withConfig(startbot))
cmd(['stopwatch'], stopBot)
cmd(['quit'], quit)
