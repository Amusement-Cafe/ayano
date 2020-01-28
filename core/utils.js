
const requireOrDefault = (module, def) => {
    try {
        return require(module)
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') 
            throw e

        return def
    }
}

module.exports = {
    requireOrDefault
}