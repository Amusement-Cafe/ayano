const { pcmd }          = require('../core/cmd')
const events            = require('../core/events')
const child             = require('child_process')

const { 
    withConfig, 
    withCLI,
    withDB,
} = require('../core/with')

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

let bot, connected

const create = withConfig((ctx) => {

    ctx.allowExit = false
    const options = Object.assign(ctx.config.ayanobot,  {mongoUri: ctx.config.database, grouptimeout: ctx.config.grouptimeout})

    bot = child.fork('./modules/ayano.js', {env: options})
    bot.send({db: true})


    bot.on('message', (msg) => {
        if (msg.connected) connected = true
        if (msg.error) ctx.error(msg.error)
        if (msg.info) ctx.info(msg.info)
        if (msg.input) ctx.input(msg.args, msg.roles)
    })

    events.on('info', (msg, title) => {
        if (connected)
            bot.send({send: true, content: msg, color: colors.green, title: title})
    })
    events.on('warn', (msg, title) => {
        if (connected)
            bot.send({send: true, content: msg, color: colors.yellow, title: title})
    })
    events.on('error', (err) => {
        if (connected)
            try {
                if(err.message && err.stack)
                    bot.send({send: true, content: err.stack, color: colors.red, title: err.message})
                else
                    bot.send({send: true, content: err, color: colors.red})
            } catch (e) {
                console.log(e)
            }
    })

    events.on('quit', () => disconnect(ctx))

})

const startbot = async(ctx) => {
    if(connected)
        return await ctx.error(`**Ayano bot** is already running`)

    if(!bot) create(ctx)

    await bot.send({connect: true})
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Ayano bot** is not running`)

    bot.send({quit: true})
    await ctx.warn('**Ayano bot** was disconnected')
    connected = false
    bot = null
}

pcmd(['admin'],['watch'], withCLI(withConfig(withDB(startbot))))
pcmd(['admin'],['stopwatch'], disconnect)
