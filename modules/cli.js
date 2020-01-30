
const readline  = require('readline')
const { cmd }   = require('../core/cmd')

var readLine

const createInterface = (ctx) => {
    if(readLine) return;

    console.log(`AyanoCLI v0.1.0`)

    readLine = readline.createInterface(process.stdin, process.stdout)
    readLine.setPrompt('')
    readLine.prompt()

    readLine.on('line', async line => {
        if (line === "quit" || line === "q")
            return readLine.close()

        await ctx.input(line.split(' '))
        readLine.prompt()

    }).on('close', async () => {
        await ctx.events.emit('quit')

        console.log('Bye')
        process.exit(0)
    })
}

cmd(['watch'], createInterface)
cmd(['start'], createInterface)
cmd(['default'], createInterface)
