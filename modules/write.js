const fs = require('fs')

const collections = (ctx) => {
    ctx.info('Writing collections to disk...')
    ctx.events.emit('colupdate', ctx.data.collections)

    const cols = ctx.data.collections.map(x => ({
        id: x.id,
        name: x.name,
        origin: x.origin,
        aliases: x.aliases,
        promo: x.promo,
        compressed: x.compressed
    }))

    fs.writeFileSync(`${ctx.dataPath}/collections.json`, JSON.stringify(cols, null, 2))
}

const cards = (ctx) => {
    ctx.info('Writing cards to disk...')
    ctx.events.emit('cardupdate', ctx.data.cards)

    const list = ctx.data.cards.map(x => ({
        name: x.name,
        level: x.level,
        animated: x.animated,
        col: x.col
    }))

    fs.writeFileSync(`${ctx.dataPath}/cards.json`, JSON.stringify(list, null, 2))
}

module.exports= { collections, cards }
