#!/usr/bin/env node

const main = async () => {

    const ctx = {
        info: (msg, shard) => console.log(`[INFO${shard? ` SH${shard}`:''}] ${msg}`),
        warn: (msg, shard) => console.warn(`[WARN${shard? ` SH${shard}`:''}] ${msg}`),
        error: (msg, shard) => console.error(`[ERR${shard? ` SH${shard}`:''}] ${msg}`),
    }

    require('./core')(ctx, process.argv.slice(2))
}


main().catch(console.error)
