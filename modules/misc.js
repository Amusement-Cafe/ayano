
const { cmd } = require('../core/cmd')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const stress = async (ctx) => {
    for(let i=0; i<10; i++) {
        ctx.info(`Test message ${i + 1}`)
        await sleep(Math.random() * 1000)
    }
}

cmd(['stress'], stress)
