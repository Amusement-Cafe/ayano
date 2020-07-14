const Eris              = require('eris')
const { cmd }           = require('../core/cmd')
const events            = require('../core/events')

const { 
    withConfig, 
    withCLI 
} = require('../core/with')

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

var bot, connected, msgstack

const create = withConfig((ctx) => {

    ctx.allowExit = false
    bot = new Eris(ctx.config.ayanobot.token)
    var replych = ctx.config.ayanobot.reportchannel, msgstack, tm, tmpnotice

    const prefix = ctx.config.ayanobot.prefix
    const send = async (content, col, title) => {
        if(!connected) return;

        try {
            const color = col || colors.blue
            const embed = { description: content, color, title }

            const endStack = async () => {
                await bot.createMessage(replych, { embed: msgstack })
                msgstack = null

                if(tmpnotice) {
                    await bot.deleteMessage(replych, tmpnotice.id)
                    tmpnotice = null
                }
            }

            if(msgstack && msgstack.color === color) {
                msgstack.description += `\n${content}`
                //await bot.editMessage(msgstack.ch, msgstack.id, { embed: msgstack.embed })
            } else {
                if(msgstack && msgstack.color != color) {
                    clearTimeout(tm)
                    await endStack()
                }

                //tmpnotice = await bot.createMessage(replych, { embed: { description: `Executing...`, color: colors.yellow } })
                msgstack = embed
            }

            clearTimeout(tm)
            tm = setTimeout(() => endStack(), ctx.config.grouptimeout)

        } catch(e) { ctx.error(e) }
    } 

    events.on('info', (msg, title) => send(msg, colors.green, title))
    events.on('warn', (msg, title) => send(msg, colors.yellow, title))
    events.on('error', (err) => {
        if(err.message && err.stack)
            send(err.stack, colors.red, err.message)
        else 
            send(err, colors.red)
    })

    /* events */
    bot.on('ready', async event => {
        connected = true

        ctx.info('AyanoBOT connected and ready')
        await bot.editStatus('online', { name: 'over you', type: 3})
    })

    bot.on('messageCreate', async (msg) => {
        if (!msg.content.startsWith(prefix)) return;
        if (msg.author.bot) return;
        msg.content = msg.content.toLowerCase()

        const isadmin = ctx.config.ayanobot.admins.includes(msg.author.id)
        //const ismod = TODO

        if(msg.content.toLowerCase().trim() === prefix)
            return bot.createMessage(msg.channel.id, 'lmao')

        if(!isadmin) return

        try {
            const args = msg.content.trim()
                .toLowerCase()
                .substring(prefix.length + 1)
                .replace(/\s\s+/, ' ')
                .split(/\s/)
                .filter(x => x)

            replych = msg.channel.id
            await ctx.input(args)
            replych = ctx.config.ayanobot.reportchannel
        } catch(e) {
            ctx.error(e)
        }
    })

    bot.on('disconnect', () => {
        console.log('Bot disconnected')
    })

    bot.on('error', ctx.error)

    events.on('quit', () => disconnect(ctx))

})

const startbot = async(ctx, argv) => {
    if(connected)
        return await ctx.error(`AyanoBOT is already running`)

    if(!bot) create(ctx)
    
    await bot.connect()
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`AyanoBOT is not running`)

    await bot.disconnect()
    await ctx.warn('AyanoBOT was disconnected')
    connected = false
}

cmd(['watch'], withCLI(withConfig(startbot)))
cmd(['stopwatch'], disconnect)
