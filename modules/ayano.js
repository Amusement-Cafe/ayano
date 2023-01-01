const Eris          = require("eris")
const {MongoClient} = require("mongodb")

const colors = {
    red: 14356753,
    yellow: 16756480,
    green: 1030733,
    blue: 1420012,
}

const bot = new Eris(process.env.token)
let replych = process.env.reportchannel, msgstack, tm, tmpnotice, db
const prefix = process.env.prefix


const startup = async () => {
    await bot.connect()
}

process.on('message', async (msg) => {
    if (msg.send) await send(msg.content, msg.color, msg.title)
    if (msg.quit) process.exit()
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
            msgstack.description = msgstack.description.substring(0, 2047)
            const embed = { embed: msgstack }
            msgstack = null
            try {
                await bot.createMessage(replych, embed)
            } catch (e) { process.send({error: e}) }

            if(tmpnotice) {
                await bot.deleteMessage(replych, tmpnotice.id)
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

    } catch(e) { process.send({error: e}) }
}

/* events */
bot.once('ready', async () => {
    process.send({info: '**Ayano bot** connected and ready', connected: true})
    await bot.editStatus('online', { name: 'over you', type: 3})
})

bot.on('messageCreate', async (msg) => {
    msg.content = msg.content.toLowerCase()
    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;

    if(msg.content.toLowerCase().trim() === prefix)
        return bot.createMessage(msg.channel.id, 'lmao')

    const user = await db.collection('users').findOne({discord_id: msg.author.id})

    if(!user || user.roles.length === 0) return

    try {
        const args = msg.content.trim()
            .toLowerCase()
            .substring(prefix.length + 1)
            .replace(/\s\s+/, ' ')
            .split(/\s/)
            .filter(x => x)

        replych = msg.channel.id
        process.send({input: true, args: args, roles: user.roles})
        replych = process.env.reportchannel
    } catch(e) {
        process.send({error: e})
    }
})

bot.on('disconnect', () => {
    console.log('Bot disconnected')
})

bot.on('error', (err) => process.send({error: err}))
