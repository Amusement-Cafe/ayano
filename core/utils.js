
const fs = require('fs')

const requireOrDefault = (module, def) => {
    try {
        return require(module)
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') 
            throw e

        return def
    }
}

const readOrDefault = (module, def) => {
    try {
        const rawdata = fs.readFileSync(`${module}.json`);
        return JSON.parse(rawdata);
    } catch (e) {
        return def
    }
}

module.exports = {
    requireOrDefault,
    readOrDefault
}