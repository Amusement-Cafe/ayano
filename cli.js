#!/usr/bin/env node

const core = require('./core')
const readline = require('readline')

const main = async () => {
    var keepalive = true

    var ctx = {
        info: (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`),
        warn: (msg, shard) => console.warn(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`),
        error: (err, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, err)
    }

    console.log(`AyanoCLI v0.1.0`)
    await core(ctx, process.argv.slice(2))

    if(keepalive) {
        const rl = readline.createInterface(process.stdin, process.stdout)
        rl.setPrompt('')
        rl.prompt()

        rl.on('line', async line => {
            if (line === "quit" || line === "q") 
                return rl.close()

            await core(ctx, line.split(' '))
            rl.prompt()

        }).on('close', async () => {
            await core(ctx, ['quit'])

            console.log('Bye')
            process.exit(0)
        })

    } else process.exit(0)
}


main().catch(console.error)
