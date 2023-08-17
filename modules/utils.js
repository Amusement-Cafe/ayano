
const { pcmd }       = require('../core/cmd')
const cardMod       = require('../../amusementclub2.0/modules/card.js')
const write         = require('./write')
const s3            = require('./s3')

const { 
    withData 
} = require('../core/with')

const rename = async (ctx, args) => {
    if(!args){
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if(parts.length < 2){
        return ctx.error(`Please specify card query followed by new name divided with ','`)
    }

    const query = parts[0].trim()
    const name = parts[1].trim().replace(/\s/g, '_')
    const parsedargs = cardMod.parseArgs({
        options: [],
        cards: ctx.data.cards,
        collections: ctx.data.collections
    }, null, {name: 'card_query', value: query})

    const filtered = cardMod.filter(ctx.data.cards, parsedargs)
    const card = cardMod.bestMatch(filtered)
    console.log(card)

    if(!card) {
        return ctx.error(`Card '${args.join(' ')}' wasn't found`)
    }

    const oldName = card.name
    card.name = name
    write.cards(ctx)
    ctx.info(`Updated card with new name ${cardMod.formatName(card)} (old name '${oldName}')`)

    const col = ctx.data.collections.find(x => x.id === card.col)
    const promo = col.promo? 'promo' : 'cards'
    let ext = col.compressed? 'jpg' : 'png'
    ext = card.animated? 'gif' : ext

    const oldKey = `${promo}/${card.col}/${card.level}_${oldName}.${ext}`
    const newKey = `${promo}/${card.col}/${card.level}_${name}.${ext}`
    try {
        const code = await s3.rename(ctx, oldKey, newKey)

        if(code)
            ctx.info(`Card file has been renamed. New URL: ${ctx.config.amusement.links.baseurl}/${newKey}`)
        else
            ctx.info(`Failed to rename card file, see the errors above`)
    } catch (e) {
        ctx.info(`Failed to rename card file, see the errors above`)
        ctx.error(e)
    }

}

const banword = async (ctx, args) => {
    const word = args.join('_')

    if(ctx.data.bannedwords.some(x => x === word))
        return ctx.error(`Banned word list already contains \`${word}\``)

    ctx.data.bannedwords.push(word)
    await write.words(ctx)

    ctx.info(`Added \`${word}\` to the list of banned words`)
}

const unbanword = async (ctx, args) => {
    const word = args.join('_')

    if(!ctx.data.bannedwords.some(x => x === word))
        return ctx.error(`Banned word list doesn't contain \`${word}\``)

    ctx.data.bannedwords = ctx.data.bannedwords.filter(x => x != word)
    await write.words(ctx)
    console.log(ctx.data.bannedwords)

    ctx.info(`Removed \`${word}\` from the list of banned words`)
}

const alias = async (ctx, args) => {
    if(!args){
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if(parts.length < 2){
        return ctx.error(`Please specify collection followed by the new alias divided with ','`)
    }

    const colQ = parts[0].trim()
    const alias = parts[1].trim().replace(/\s/g, '_')

    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to alias!')

    col.aliases.push(alias)
    await write.collections(ctx)

    ctx.info(`Added \`${alias}\` as an alias to \`${colQ}\``)
}

const unalias = async (ctx, args) => {
    if(!args){
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if(parts.length < 2){
        return ctx.error(`Please specify collection followed by the alias to remove divided with ','`)
    }

    const colQ = parts[0].trim()
    const alias = parts[1].trim().replace(/\s/g, '_')

    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to unalias!')

    if (col.aliases.length === 1)
        return ctx.error(`There is only 1 alias for ${colQ} and it cannot be removed!`)

    if (!col.aliases.includes(alias))
        return ctx.error(`The collection \`${colQ}\` does not contain the alias \`${alias}\``)

    col.aliases = col.aliases.filter(x => x != alias)
    await write.collections(ctx)

    ctx.info(`Removed \`${alias}\` as an alias for \`${colQ}\``)
}

const coldisplay = async (ctx, args, ...extra) => {
    console.log(args)
    console.log(extra)
    if(!args){
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')
    const capParts = extra.join(' ').split(',')

    if(parts.length < 2){
        return ctx.error(`Please specify collection followed by the new alias divided with ','`)
    }

    const colQ = parts[0].trim()
    const display = capParts[1].trim()

    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to change display name of!')

    col.name = display
    await write.collections(ctx)

    ctx.info(`Set **${display}** as the new display name for \`${colQ}\``)
}

const colrarity = async (ctx, args) => {
    if (!args) {
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if (parts.length < 2) {
        return ctx.error(`Please specify collection followed by the rarity percentage to set divided with ','`)
    }

    const colQ = parts[0].trim()
    const rarity = parts[1].trim()

    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to change rarity of!')

    if (isNaN(rarity))
        return ctx.error(`A valid number is required to set rarity!`)

    col.rarity = rarity / 100
    await write.collections(ctx)

    ctx.info(`Set rarity of \`${colQ}\` to **${rarity}%**`)
}

const colauthor = async (ctx, args) => {
    if(!args) {
        return ctx.error(`At least 2 arguments required`)
    }

    const parts = args.join(' ').split(',')

    if (parts.length < 2) {
        return ctx.error(`Please specify collection followed by the user ID to set as the author divided with ','`)
    }

    const colQ = parts[0].trim()
    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to change author of!')

    col.author = parts[1].trim()
    await write.collections(ctx)

    ctx.info(`Set author of \`${colQ}\` to <@${parts[1].trim()}>`)

}

const colcompressed = async (ctx, args) => {
    if (!args) {
        return ctx.error(`An argument is required`)
    }

    const colQ = args.join(' ').trim()
    const col = ctx.data.collections.filter(x => colQ === x.id)?.pop()

    if (!col || col.length === 0)
        return ctx.error('No collection found to change compression status of!')

    col.compressed = !col.compressed
    await write.collections(ctx)

    ctx.info(`Set compression of \`${colQ}\` to **${col.compressed}**`)

}

pcmd(['admin', 'cardmod'], ['rename'], withData(rename))
pcmd(['admin', 'mod'], ['banword'], withData(banword))
pcmd(['admin', 'mod'], ['unbanword'], withData(unbanword))
pcmd(['admin', 'mod'], ['coldisplay'], withData(coldisplay))
pcmd(['admin', 'mod'], ['colrarity'], withData(colrarity))
pcmd(['admin', 'mod'], ['colauthor'], withData(colauthor))
pcmd(['admin', 'mod'], ['colcompressed'], withData(colcompressed))
pcmd(['admin', 'mod'], ['alias'], withData(alias))
pcmd(['admin', 'mod'], ['unalias'], withData(unalias))

