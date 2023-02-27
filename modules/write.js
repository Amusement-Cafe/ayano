const fs = require('fs')
const _  = require('lodash')

const collections = (ctx) => {
    ctx.info('Writing collections to disk...')

    ctx.data.collections = ctx.data.collections.map(x => _.pick(x, [
        'id',
        'name',
        'origin',
        'aliases',
        'promo',
        'compressed',
        'dateAdded',
        'author',
        'rarity',
    ]))

    ctx.events.emit('colupdate', ctx.data.collections)

    fs.writeFileSync(`${ctx.dataPath}/collections.json`, JSON.stringify(ctx.data.collections, null, 2))
}

const cards = (ctx) => {
    ctx.info('Writing cards to disk...')

    ctx.data.cards = ctx.data.cards.map(x => _.pick(x, [
        'name',
        'level',
        'animated',
        'col',
        'id',
        'imgur',
    ]))

    ctx.events.emit('cardupdate', ctx.data.cards)

    fs.writeFileSync(`${ctx.dataPath}/cards.json`, JSON.stringify(ctx.data.cards, null, 2))
}

const promos = (ctx) => {
    ctx.info('Writing promos to disk...')
    ctx.events.emit('promoupdate', ctx.data.promos)

    fs.writeFileSync(`${ctx.dataPath}/promos.json`, JSON.stringify(ctx.data.promos, null, 2))
}

const boosts = (ctx) => {
    ctx.info('Writing boosts to disk...')
    ctx.events.emit('boostupdate', ctx.data.boosts)

    fs.writeFileSync(`${ctx.dataPath}/boosts.json`, JSON.stringify(ctx.data.boosts, null, 2))
}

const words = (ctx) => {
    ctx.info('Writing banned words list to disk...')
    ctx.events.emit('wordsupdate', ctx.data.bannedwords)

    fs.writeFileSync(`${ctx.dataPath}/bannedwords.json`, JSON.stringify(ctx.data.bannedwords, null, 2))
}

module.exports = { collections, cards, promos, boosts, words }
