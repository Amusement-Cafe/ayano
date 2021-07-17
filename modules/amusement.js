/*
* Support for starting and managing amusement club cluster
* Used by CLI and bot
*/
 
const { cmd, pcmd }   = require('../core/cmd')
const events          = require('../core/events')
const forever         = require('forever-monitor')

const { 
    withConfig, 
    withData, 
    withCLI 
}  = require('../core/with')

var instance, connected, amusement

const create = async (ctx) => {

    amusement = require('amusementclub2.0')
    ctx.allowExit = false
    const options  = Object.assign({shards: ctx.config.shards, data: ctx.data}, ctx.config.shard)
    instance = await amusement.create(options)

    instance.emitter.on('info', (msg, title) => ctx.info(`[Amusement] ${msg}`, title))
    instance.emitter.on('error', ctx.error)

    events.on('quit', () => disconnect(ctx))
    events.on('colupdate', (data) => instance.updateCols(data))
    events.on('cardupdate', (data) => instance.updateCards(data))
    events.on('promoupdate', (data) => instance.updatePromos(data))
    events.on('boostupdate', (data) => instance.updateBoosts(data))
    events.on('wordsupdate', (data) => instance.updateWords(data))
}

const startBot = async (ctx) => {
    if(connected)
        return await ctx.error(`**Amusement bot** is already running`)
    
    if(!instance) await create(ctx)

    await instance.connect()
    connected = true
}

const disconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await instance.disconnect()
    await ctx.warn(`**Amusement bot** was disconnected`)
    connected = false
}

const delay = time => new Promise(res=>setTimeout(res,time));

const restart = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await disconnect(ctx)
    instance = null
    let path = require.cache[require.resolve('amusementclub2.0')].path
    Object.keys(require.cache).map(x => {
        if (x.startsWith(path))
            delete require.cache[x]
    })
    await delay(5000)
    await startBot(ctx)
    await ctx.info(`Restarted **Amusement bot**`)
}

const reconnect = async (ctx) => {
    if(!connected)
        return await ctx.error(`**Amusement bot** is not running`)

    await disconnect(ctx)
    await startBot(ctx)
    await ctx.info(`Restarted Amusement bot connection to Discord`)
}

const gitPull = async (ctx) => {
    let gitLog = ""
    try {
        const child = forever.start(['git', 'pull'], {
            cwd: require.cache[require.resolve('amusementclub2.0')].path,
            silent: false,
            max: 0,
            killTree: true
        })

        child.on('stdout', function (stdout) {
            gitLog += stdout + '\n'
        })

        child.on('exit', async function (fChild) {
            await ctx.info(gitLog)
            if (!gitLog.startsWith('Already up to date.'))
                await restart(ctx)
        })
    } catch (e) {
        await ctx.error("Error pulling from github\n" + e)
    }

}

pcmd(['admin'],['start'], withCLI(withConfig(withData(startBot))))
pcmd(['admin'],['stop'], disconnect)
pcmd(['admin', 'mod'],['restart'], restart)
pcmd(['admin'],['reconnect'], reconnect)
pcmd(['admin'], ['git', 'pull'], gitPull)
