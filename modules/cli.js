
const readline = require('readline')

module.exports = (ctx) => {

	ctx.events.on('info', (msg, shard) => console.log(`[INFO${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    ctx.events.on('warn', (msg, shard) => console.warn(`[WARN${!isNaN(shard)? ` SH${shard}`:''}] ${msg}`))
    ctx.events.on('error', (msg, shard) => console.error(`[ERR${!isNaN(shard)? ` SH${shard}`:''}]`, msg))
}

const createInterface = (ctx) => {

    console.log(`AyanoCLI v0.1.0`)

    const rl = readline.createInterface(process.stdin, process.stdout)
    rl.setPrompt('')
    rl.prompt()

    rl.on('line', async line => {
        if (line === "quit" || line === "q")
            return rl.close()

        await core(line.split(' '))
        rl.prompt()

    }).on('close', async () => {
        ctx.events.emit('quit')

        console.log('Bye')
        process.exit(0)
    })
}

cmd(['watch'], createInterface)
