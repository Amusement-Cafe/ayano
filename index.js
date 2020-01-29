#!/usr/bin/env node

const core = require('./core')

const main = () => core.input(process.argv.slice(2))

main().catch(console.error)
