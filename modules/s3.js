
const { pcmd }           = require('../core/cmd')
const commandLineArgs   = require('command-line-args')
const write             = require('./write')

const { 
    withConfig,
    withData,
    withS3
} = require('../core/with')


const acceptedExts = ['png', 'gif', 'jpg']

const update = async (ctx, ...args) => {
    const conf = ctx.config.aws
    ctx.warn(`Initializing card update...`)

    const options = getoptions(ctx, ...args)
    const params = { Bucket: conf.bucket, MaxKeys: 2000 }
    let data = {}, passes = 1, newcol = false, newcard = false

    do {
        try {
            let count = 0
            data = await ctx.s3.listObjects(params).promise()
            params.Marker = data.Contents[data.Contents.length - 1].Key

            data.Contents.filter(x => x.Key.startsWith(options.promo? 'promo/' : conf.cardroot)).map(x => {
                const item = x.Key.split('.')[0]
                const ext = x.Key.split('.')[1]
                if(ext && acceptedExts.includes(ext)) {
                    const split = item.split('/')
                    if(split.length === 3 && (!options.col || options.col.includes(split[1]))) {
                        if(!ctx.data.collections.filter(c => c.id === split[1])[0]) {
                            ctx.data.collections.push({
                                id: split[1], 
                                name: split[1],
                                aliases: [split[1]],
                                promo: options.promo,
                                compressed: ext === 'jpg'
                            })

                            ctx.info(`New collection: **${split[1]}**`)
                            newcol = true
                        }

                        const card = getCardObject(split[2] + '.' + ext, split[1])
                        if(!ctx.data.cards.filter(x => x.name === card.name 
                            && x.level === card.level 
                            && x.col === card.col)[0]){
                            count++
                            ctx.data.cards.push(card)
                            newcard = true
                        }
                    }
                }
            })

            ctx.info(`Pass ${passes} got ${count} new cards`)
            passes++
        } catch (e) {
            return ctx.error(e)
        }
    } while(data.IsTruncated)

    ctx.info(`Finished updating cards`)
    if(newcol) write.collections(ctx)
    if(newcard) write.cards(ctx)

    ctx.info(`All data was checked and saved`)
}

const rename = async (ctx, oldKey, newKey) => {
    const conf = ctx.config.aws
    console.log(oldKey)
    console.log(newKey)
    try {
        await ctx.s3.copyObject({
            Bucket: conf.bucket, 
            CopySource: `${conf.bucket}/${oldKey}`, 
            Key: newKey,
            ACL:'public-read'
        }).promise()

        await ctx.s3.deleteObject({
            Bucket: conf.bucket, 
            Key: oldKey
        }).promise()

        return 1
    } catch(e) {
        ctx.error(e)
    }

    return 0
}

const getoptions = (ctx, ...argv) => {
    if(!argv) return {}

    const options = commandLineArgs([
            { name: 'col', alias: 'c', type: String, multiple: true, defaultOption: true },
            { name: 'promo', alias:'p', type: Boolean },
        ], { argv, stopAtFirstUnknown: true })

    const info = []
    if(options.col) {
        const cols = ctx.data.collections.filter(x => options.col.includes(x.id))

        if(cols.length > 0)
            info.push(`Updating cards for collection(s): ${cols.map(x => x.name || x.id).join(' | ')}`)

        if(cols.length != options.col.length)
            info.push(`Considering new collection cards from ${options.col.filter(x => cols.filter(y => y.id === x)).join(' | ')}`)
    }

    if(options.promo)
        info.push(`Added collections will be marked as promo`)

    if(info.length > 0)
        ctx.info(info.join('\n'))

    return options
}

const getCardObject = (name, collection) => {
    name = name
        .replace(/ /g, '_')
        .replace(/'/g, '')
        .trim()
        .toLowerCase()
        .replace(/&apos;/g, "")

    const split = name.split('.')
    return {
        name: split[0].substr(2),
        col: collection,
        level: parseInt(name[0]),
        animated: split[1] === 'gif'
    }
}

pcmd(['admin', 'cardmod'], ['update'], withConfig(withData(withS3(update))))

module.exports = { 
    rename: withConfig(withS3(rename))
}
