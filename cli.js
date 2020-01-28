#!/usr/bin/env node

const main = async () => {

    const ctx = {
        info: (msg, shard) => console.log(`[INFO${shard? ` SH${shard}`:''}] ${msg}`),
        warn: (msg, shard) => console.warn(`[WARN${shard? ` SH${shard}`:''}] ${msg}`),
        error: (err, shard) => { 
            console.error(`[ERR${shard? ` SH${shard}`:''}]`, err)
            if(!shard) process.exit()
        }
    }

    await require('./core')(ctx, process.argv.slice(2))

    process.exit()
}


main().catch(console.error)
