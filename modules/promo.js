/*
* Support for starting promos and claim boosts
* Used by CLI and bot
*/

const { pcmd }           = require('../core/cmd')
const { modules }       = require('amusementclub2.0')
const { 
    withData,
    withConfig,
    withDB
} = require('../core/with')

const commandLineArgs   = require('command-line-args')
const write             = require('./write')

require('datejs')

const addPromo = async (ctx, ...args) => {
    const options = commandLineArgs([
        { name: 'src', defaultOption: true },
        { name: 'start', alias: 's', type: x => Date.parse(x) },
        { name: 'end', alias: 'e', type: x => Date.parse(x) },
        { name: 'currency', alias: 'c', type: String },
    ], { argv: args })

    if(!options.src)
        return ctx.error('--src parameter is required (source collection)')

    if(!options.start || !options.end)
        return ctx.error('--start and --end should be dates')

    if(!options.currency)
        return ctx.error('--currency parameter is required')

    const col = ctx.data.collections.filter(x => x.id === options.src)[0]

    if(!col)
        return ctx.error(`Collection '${options.src}' was not found. Please update cards first`)

    if(ctx.data.promos.some(x => x.id === options.src))
        return ctx.error(`Promo '${options.src}' walready exists`)

    const promo = {
        id: options.src,
        name: col.name,
        starts: options.start,
        expires: options.end,
        currency: options.currency,
    }

    ctx.data.promos.push(promo)
    write.promos(ctx)

    return ctx.info(`Created new promo:\n${Object.entries(promo).map(([key, value]) => `${key}: ${value}`).join('\n')}`)
}

const addBoost = async (ctx, ...args) => {
    const options = commandLineArgs([
        { name: 'id', type: String, defaultOption: true },
        { name: 'name', type: String },
        { name: 'start', alias: 's', type: x => Date.parse(x) },
        { name: 'end', alias: 'e', type: x => Date.parse(x) },
        { name: 'query', alias: 'q', type: String },
        { name: 'rate', alias: 'r', type: Number },
    ], { argv: args })

    if(!options.id)
        return ctx.error('Boost id is required')

    if(!options.query)
        return ctx.error('--query parameter is required (cards search request)')

    if(!options.start || !options.end)
        return ctx.error('--start and --end should be dates')

    if(ctx.data.boosts.some(x => x.id === options.id))
        return ctx.error(`Boost with id \`${options.id}\` already exists`)

    const parsedargs = modules.card.parseArgs({
        cards: ctx.data.cards,
        collections: ctx.data.collections,
    }, options.query.replace(/"/g, '').split(' '))

    const cards = modules.card.filter(ctx.data.cards, parsedargs)
        .filter(x => [1,2,3].includes(x.level))

    if(cards.length == 0)
        return ctx.error(`Could not find any 1-3star cards matching that request`)

    const boost = {
        id: options.id,
        name: options.name || options.id,
        starts: options.start,
        expires: options.end,
        rate: options.rate || .33,
        cards: cards.map(x => x.id)
    }

    ctx.data.boosts.push(boost)
    write.boosts(ctx)

    return ctx.info(`Created new boost: **${boost.name}** with **${boost.cards.length}** cards`)
}

pcmd(['admin'],['promo'], withData(addPromo))
pcmd(['admin'],['boost'], withData(addBoost))
