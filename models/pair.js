/**
 * @typedef {import('./asset')} Asset
 */

class Pair {
    /**
     *
     * @param {Asset} base - base asset
     * @param {Asset} quote - quote asset
     */
    constructor(base, quote) {
        this.base = base
        this.quote = quote
        this.name = `${base.name}/${quote.name}`
    }
}

module.exports = Pair