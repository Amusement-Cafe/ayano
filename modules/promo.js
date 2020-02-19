/*
* Support for starting promos and claim boosts
* Used by CLI and bot
*/

const { cmd }           = require('../core/cmd')
const { 
    withData,
    withConfig,
    withDB
} = require('../core/with')

const commandLineArgs   = require('command-line-args')
const write             = require('./write')

require('datejs')

const addPromo = async (ctx, argv) => {
    const options = commandLineArgs([
        { name: 'src', defaultOption: true },
        { name: 'start', alias: 's', type: x => Date.parse(x) },
        { name: 'end', alias: 'e', type: x => Date.parse(x) },
        { name: 'currency', alias: 'c', type: String },
    ], { argv })

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

cmd(['promo'], withData(addPromo))
