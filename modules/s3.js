
const AWS               = require('aws-sdk')
const { cmd }           = require('../core/cmd')
const commandLineArgs   = require('command-line-args')
const fs                = require('fs')
const { 
    withConfig,
    withData 
} = require('../core/with')


const acceptedExts = ['png', 'gif', 'jpg']

var s3, endpoint, conf

const create = (ctx) => {
    conf = ctx.config.aws
    endpoint = new AWS.Endpoint(conf.endpoint)
    s3 = new AWS.S3({
        endpoint, 
        accessKeyId: conf.s3accessKeyId, 
        secretAccessKey: conf.s3secretAccessKey
    })
}

const update = async (ctx, argv) => {
    if(!s3) create(ctx)

    ctx.warn(`Initializing card update...`)

    const options = getoptions(ctx, argv)
    const params = { Bucket: conf.bucket, MaxKeys: 2000 }
    const res = []
    let data = {}, passes = 1, newcol = false, newcard = false

    do {
        try {
            let count = 0
            data = await listObjectsAsync(params)
            params.Marker = data.Contents[data.Contents.length - 1].Key

            data.Contents.filter(x => x.Key.startsWith(conf.cardroot)).map(x => {
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
                                promo: false,
                                compressed: ext === 'jpg'
                            })

                            res.push(`New collection: **${split[1]}**`)
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

            res.push(`Pass ${passes} got ${count} new cards`)
            passes++
        } catch (e) {
            return ctx.error(e)
        }
    } while(data.IsTruncated)

    res.push(`Finished updating cards. Writing data to disk...`)
    ctx.info(res.join('\n'))

    if(newcol) {
        ctx.info('Writing collections to disk...')
        fs.writeFileSync(`${ctx.dataPath}/collections.json`, JSON.stringify(ctx.data.collections, null, 2))
        ctx.events.emit('colupdate', ctx.data.collections)
    }

    if(newcard) {
        ctx.info('Writing cards to disk...')
        fs.writeFileSync(`${ctx.dataPath}/cards.json`, JSON.stringify(ctx.data.cards, null, 2))
        ctx.events.emit('cardupdate', ctx.data.collections)
    }
    
    ctx.info(`All data was saved`)
}

const getoptions = (ctx, argv) => {
    if(!argv) return {}

    const options = commandLineArgs([
            { name: 'col', type: String, multiple: true, defaultOption: true },
        ], { argv, stopAtFirstUnknown: true })

    const info = []
    if(options.col) {
        const cols = ctx.data.collections.filter(x => options.col.includes(x.id))

        info.push(`Updating cards for collection(s): **${cols.map(x => x.name || x.id).join(' | ')}**`)

        if(cols.length != options.col.length)
            info.push(`Considering new collection cards from ${options.col.filter(x => cols.filter(y => y.id === x)).join(' | ')}`)
    }

    ctx.info(info.join('\n'))

    return options
}

const listObjectsAsync = (params) => new Promise((resolve, reject) => { 
    s3.listObjects(params, (err, data) => { 
        if(err){
            reject(err) 
        } else {
            resolve(data)
        }
    })
})

const getCardObject = (name, collection) => {
    name = name
        .replace(/ /g, '_')
        .replace(/'/g, '')
        .trim()
        .toLowerCase()
        .replace(/&apos;/g, "")

    const split = name.split('.')
    col = collection.replace(/=/g, '')

    return {
        name: split[0].substr(2),
        col,
        level: parseInt(name[0]),
        animated: split[1] === 'gif'
    }
}

cmd(['update'], withConfig(withData(update)))
