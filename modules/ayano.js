// const Eris          = require("eris")
const Oceanic       = require('oceanic.js')
const {MongoClient} = require("mongodb")

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

// const bot = new Eris(process.env.token)
const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token, gateway: { intents: ["MESSAGE_CONTENT", "GUILD_MESSAGES", "DIRECT_MESSAGES"]}})
let replych = process.env.reportchannel, msgstack, tm, tmpnotice, db
const prefix = process.env.prefix


const startup = async () => {
    await bot.connect()
}

const shutdown = async () => {
    await bot.disconnect(false)
    process.exit()
}

process.on('message', async (msg) => {
    if (msg.send) await send(msg.content, msg.color, msg.title)
    if (msg.quit) await shutdown()
    if (msg.connect) await startup()
    if (msg.db) db = (await MongoClient.connect(process.env.mongoUri, {useNewUrlParser: true, useUnifiedTopology: true})).db('amusement2')
})

const send = async (content, col, title) => {
    try {
        const color = col || colors.blue
        const embed = { description: content, color, title }

        const endStack = async () => {
            if (msgstack.title)
                msgstack.title = msgstack.title.substring(0, 255)
            if (!msgstack.description)
                return
            msgstack.description = msgstack.description.substring(0, 2047)
            const embed = { embeds: [msgstack] }
            msgstack = null
            try {
                await bot.rest.channels.createMessage(replych, embed)
            } catch (e) { process.send({error: e}) }

            if(tmpnotice) {
                await bot.rest.channels.deleteMessage(replych, tmpnotice.id)
                tmpnotice = null
            }
        }

        if(msgstack && msgstack.color === color) {
            msgstack.description += `\n${content}`
        } else {
            if(msgstack && msgstack.color != color) {
                clearTimeout(tm)
                await endStack()
            }

            msgstack = embed
        }

        clearTimeout(tm)
        tm = setTimeout(() => endStack(), process.env.grouptimeout)

    } catch(e) { process.send({error: {message: e.message, stack: e.stack}}) }
}

/* events */
bot.once('ready', async () => {
    process.send({info: '**Ayano bot** connected and ready', connected: true})
    await bot.editStatus('online', [{ name: 'over you', type: 3}])
})

bot.on('messageCreate', async (msg) => {
    const baseMessage = msg.content
    const lowerMessage = msg.content.toLowerCase()
    if (!lowerMessage.startsWith(prefix)) return;
    if (msg.author.bot) return;

    if(lowerMessage.trim() === prefix)
        return bot.rest.channels.createMessage(msg.channelID, {content: 'lmao'})

    const user = await db.collection('users').findOne({discord_id: msg.author.id})

    if(!user || user.roles.length === 0) return

    try {
        const args = lowerMessage.trim()
            .toLowerCase()
            .substring(prefix.length + 1)
            .replace(/\s\s+/, ' ')
            .split(/\s/)
            .filter(x => x)

        const extra = baseMessage.trim()
            .substring(prefix.length + 1)
            .replace(/\s\s+/, ' ')
            .split(/\s/)
            .filter(x => x)

        replych = msg.channelID
        process.send({input: true, args: args, roles: user.roles, extra: extra})
        replych = process.env.reportchannel
    } catch(e) {
        process.send({error: {message: e.message, stack: e.stack}})
    }
})

bot.on('disconnect', () => {
    console.log('Bot disconnected')
})

bot.on('error', (err) => process.send({error: {message: err.message, stack: err.stack}}))
