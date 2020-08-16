
const { cmd } = require('../core/cmd')
const { 
    withData,
} = require('../core/with')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const stress = async (ctx) => {
    for(let i=0; i<10; i++) {
        ctx.info(`Test message ${i + 1}`)
        await sleep(Math.random() * 1000)
    }
}

const flushdata = (ctx) => {
    ctx.data = null
    withData((ctx) => {
        console.log(ctx.data.boosts)
        ctx.events.emit('colupdate', ctx.data.collections)
        ctx.events.emit('cardupdate', ctx.data.cards)
        ctx.events.emit('promoupdate', ctx.data.promos)
        ctx.events.emit('boostupdate', ctx.data.boosts)
        ctx.events.emit('wordsupdate', ctx.data.bannedwords)
        ctx.info('Reloaded collections, cards, promos, boosts and banned words')
    })(ctx)
}

cmd(['stress'], stress)
cmd(['flushdata'], flushdata)
