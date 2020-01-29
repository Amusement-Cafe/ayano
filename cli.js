#!/usr/bin/env node

const core = require('./core')
const readline = require('readline')
const modules = require('./modules')
const events = require('./core/events')

const main = async () => {

    events.on('info', (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    events.on('warn', (msg, shard) => console.warn(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    events.on('error', (msg, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, msg))

    console.log(`AyanoCLI v0.1.0`)
    await core(process.argv.slice(2))

    const rl = readline.createInterface(process.stdin, process.stdout)
    rl.setPrompt('')
    rl.prompt()

    rl.on('line', async line => {
        if (line === "quit" || line === "q") 
            return rl.close()

        await core(line.split(' '))
        rl.prompt()

    }).on('close', async () => {
        //await core(['quit'])
        events.emit('quit')

        console.log('Bye')
        process.exit(0)
    })
}


main().catch(console.error)
