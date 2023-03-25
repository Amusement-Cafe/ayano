const express       = require("express")
const bodyParser    = require("body-parser")
const Topgg         = require('@top-gg/sdk')

const {
    addVoteQueue
} = require('./amusement')

const {
    pcmd
} = require("../core/cmd")

const {
    withConfig
} = require('../core/with')

let listener

const listen = (ctx) => {
    const app = express()
    const topggWebhook = new Topgg.Webhook(ctx.config.webhooks.dbl.pass)
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }));

    // Webhook handle for https://top.gg/
    app.post("/topgg", topggWebhook.middleware(), (req, res) => {
        addVoteQueue(ctx, req.vote, 'topgg')
        res.status(200).end()
    })

    // Webhook handle for https://discordbotlist.com/
    app.post("/dbl", (req, res) => {
        if(req.headers.authorization != ctx.config.webhooks.dbl.pass) {
            console.log(`DBL webhook has incorrect auth token ${req.headers.authorization}`)
            res.status(401).end()
            return
        }
        addVoteQueue(ctx, req, 'dbl')
        res.status(200).end()
    })

    // Webhook handle for https://ko-fi.com/
    app.post("/kofi", (req, res) => {
        const obj = JSON.parse(req.body.data)

        if (obj.verification_token != ctx.config.webhooks.kofi.verification){
            console.log(`Kofi webhook has an incorrect verification token! ${obj.verification_token}`)
            res.status(401).end()
            return
        }
        addVoteQueue(ctx, obj, 'kofi')
        res.status(200).end()
    })

    listener = app.listen(ctx.config.webhooks.dbl.port, () => ctx.info(`Listening to webhooks on port ${ctx.config.webhooks.dbl.port}`))
}

pcmd(['admin'], ['listen'], withConfig(listen))
