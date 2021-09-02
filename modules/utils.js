
const { pcmd }       = require('../core/cmd')
const { modules }   = require('amusementclub2.0')
const write         = require('./write')
const s3            = require('./s3')

const { 
    withData 
} = require('../core/with')

const rename = async (ctx, ...args) => {
    if(!args){
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if(parts.length < 2){
        return ctx.error(`Please specify card query followed by new name divided with ','`)
    }

    const query = parts[0].trim().split(' ')
    const name = parts[1].trim().replace(/\s/g, '_')
    const parsedargs = modules.card.parseArgs({
        cards: ctx.data.cards,
        collections: ctx.data.collections
    }, query)

    const filtered = modules.card.filter(ctx.data.cards, parsedargs)
    const card = modules.card.bestMatch(filtered)
    console.log(card)

    if(!card) {
        return ctx.error(`Card '${args.join(' ')}' wasn't found`)
    }

    const oldName = card.name
    card.name = name
    write.cards(ctx)
    ctx.info(`Updated card with new name ${modules.card.formatName(card)} (old name '${oldName}')`)

    const col = ctx.data.collections.find(x => x.id === card.col)
    let ext = col.compressed? 'jpg' : 'png'
    ext = card.animated? 'gif' : ext

    const oldKey = `cards/${card.col}/${card.level}_${oldName}.${ext}`
    const newKey = `cards/${card.col}/${card.level}_${name}.${ext}`
    const code = await s3.rename(ctx, oldKey, newKey)

    if(code)
        ctx.info(`Card file has been renamed. New URL: ${ctx.config.shard.baseurl}/${newKey}`)
    else
        ctx.info(`Failed to rename card file, see the errors above`)
}

const banword = async (ctx, ...args) => {
    const word = args.join('_')

    if(ctx.data.bannedwords.some(x => x === word))
        return ctx.error(`Banned word list already contains \`${word}\``)

    ctx.data.bannedwords.push(word)
    await write.words(ctx)

    ctx.info(`Added \`${word}\` to the list of banned words`)
}

const unbanword = async (ctx, ...args) => {
    const word = args.join('_')

    if(!ctx.data.bannedwords.some(x => x === word))
        return ctx.error(`Banned word list doesn't contain \`${word}\``)

    ctx.data.bannedwords = ctx.data.bannedwords.filter(x => x != word)
    await write.words(ctx)
    console.log(ctx.data.bannedwords)

    ctx.info(`Removed \`${word}\` from the list of banned words`)
}

pcmd(['admin', 'mod'], ['rename'], withData(rename))
pcmd(['admin', 'mod'], ['banword'], withData(banword))
pcmd(['admin', 'mod'], ['unbanword'], withData(unbanword))
