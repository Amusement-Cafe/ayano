#!/usr/bin/env node

const core = require('./core')
const readline = require('readline')
const modules = require('./modules')

const subscribers = {}

const main = async () => {
    var keepalive = true

    const ctx = {
        on: (type, func) => {
            if(!subscribers.hasOwnProperty(type))
                subscribers[type] = []

            subscribers[type].push(func)
        }
    }

    const trigger = (type, ...args) => subscribers[type].map(fn => fn(...args))

    ctx.on('info', (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    ctx.on('warn', (msg, shard) => console.warn(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    ctx.on('error', (msg, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, msg))

    ctx.info = (msg, shard) => trigger('info', msg, shard)
    ctx.warn = (msg, shard) => trigger('warn', msg, shard)
    ctx.error = (msg, shard) => trigger('error', msg, shard)

    console.log(ctx)

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
