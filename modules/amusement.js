/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/

const child           = require('child_process')
const { pcmd }        = require('../core/cmd')
const events          = require('../core/events')

const { 
    withConfig, 
    withData, 
    withCLI 
}  = require('../core/with')

let queue = [], instance, connected, options, evs, ars

const delay = time => new Promise(res=>setTimeout(res,time))

const create = (ctx) => {
    ctx.allowExit = false
    options  = Object.assign({data: ctx.data}, ctx.config.amusement)
    instance = child.fork('../amusementclub2.0', {env: ctx.config.amusement.bot})
    instance.send({startup: options})

    instance.on('message', (msg) => {
        if (msg.info) ctx.info(`[Amusement] ${msg.info}`)
        if (msg.error) ctx.error(msg.error)
    })
    instance.on('info', (msg, title) => ctx.info(`[Amusement] ${msg}`, title))
    instance.on('error', err => ctx.error(err))

    if (!evs) {
        events.on('quit', () => disconnect(ctx))
        events.on('colupdate', (data) => instance.send({updateCols: data}))
        events.on('cardupdate', (data) => instance.send({updateCards: data}))
        events.on('promoupdate', (data) => instance.send({updatePromos: data}))
        events.on('boostupdate', (data) => instance.send({updateBoosts: data}))
        events.on('wordsupdate', (data) => instance.send({updateWords: data}))
        evs = true
    }

}

const startBot = async (ctx) => {
    if(connected)
        return await ctx.error(`**Amusement bot** is already running`)

    await ctx.info(`**Amusement bot** is starting`)
    if(!instance) create(ctx)
    connected = true
}

const autoRestart = async (ctx) => {
    await ctx.info('Starting the autorestart!')
    instance.send({autorestart: true})

    await delay(175000)

    await ctx.warn(`**Amusement bot** was disconnected`)
    connected = false
    instance = null
    await delay(1000)
    await startBot(ctx)
}

const startAutoRestart = async (ctx) => {
    if (!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    ars = setInterval(() => autoRestart(ctx), 604800 * 1000)
    await ctx.info('**Amusement Bot** auto restart has been enabled!')
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    instance.send({shutdown: true})
    await delay(1000)
    await ctx.warn(`**Amusement bot** was disconnected`)
    connected = false
    instance = null
}

const restart = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await disconnect(ctx)
    await delay(1500)
    await startBot(ctx)
    await ctx.info(`Restarted Amusement bot connection to Discord`)
}

const gitPull = async (ctx) => {
    child.exec('git pull', {cwd: '../amusementclub2.0'},
        (err, stdout, stderr) => {
        if (err)
            return ctx.error(err)
        ctx.info(stdout)
        ctx.error(stderr)
    })
}

const voteQueue = () => {
    if (queue.length === 0 || !connected)
        return
    try {
        const qItem = queue[0]
        instance.send(qItem)
        queue.shift()
    } catch (e) { }
}

const addVoteQueue = (ctx, vote, type) => {
    queue.push({vote: vote, type: type})
}

setInterval(voteQueue, 1000)

pcmd(['admin'],['start'], withCLI(withConfig(withData(startBot))))
pcmd(['admin'],['stop'], disconnect)
pcmd(['admin'],['restart'], restart)
pcmd(['admin'], ['git', 'pull'], gitPull)
pcmd(['admin'], ['autorestart'], startAutoRestart)

module.exports = {
    addVoteQueue
}
