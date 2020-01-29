const Eris              = require('eris')
const { withConfig }    = require('../core/with')
const { cmd }           = require('../core/cmd')
const core              = require('../core')
const events            = require('../core/events')

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

var bot, connected

const startbot = async(ctx, argv) => {
    if(connected)
        return await ctx.error(`AyanoBOT is already running`)

    bot = new Eris(ctx.config.ayanobot.token)
    var replych = ctx.config.ayanobot.reportchannel

    const prefix = ctx.config.ayanobot.prefix
    const send = (content, col) => bot.createMessage(replych, { embed: { description: content, color: col || colors.blue } })

    const format = (msg, shard) => `${!isNaN(shard)? `[SH${shard}] `:''}${msg}`
    const rplinfo = (msg, shard) => send(format(msg, shard), colors.green)
    const rplwarn = (msg, shard) => send(format(msg, shard), colors.yellow)
    const rplerror = (msg, shard) => send(format(msg, shard), colors.red)

    /* events */
    bot.on('ready', async event => {
        connected = true

        events.on('info', rplinfo)
        events.on('warn', rplwarn)
        events.on('error', rplerror)

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
            await core(args)
            replych = ctx.config.ayanobot.reportchannel
        } catch(e) {
            ctx.error(e)
        }
    })

    bot.on('disconnect', () => {
        console.log('unsubscribing')
        events.off('info', rplinfo)
        events.off('warn', rplwarn)
        events.off('error', rplerror)
    })

    bot.on('error', (err) => {
        ctx.error(err)
    })

    events.on('quit', () => disconnect(ctx))

    await bot.connect()
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`AyanoBOT is not running`)

    await ctx.warn('Disconnecting AyanoBOT...')
    await bot.disconnect()
    connected = false
}

cmd(['watch'], withConfig(startbot))
cmd(['stopwatch'], disconnect)
