/**
 * @typedef {import('./ohlcv')} OHLCV
 */

const {getBigIntPrice} = require('../utils')

class Price {
    constructor(timestamp, decimals) {
        this.timestamp = timestamp
        this.decimals = decimals
    }

    /**
     * @type {Array<OHLCV>}
     */
    ohlcvs = []

    /**
     * @param {OHLCV} ohlcv - OHLCV object
     */
    pushOHLCV(ohlcv) {
        this.ohlcvs.push(ohlcv)
    }

    /**
     * @returns {{price: BigInt, sources: string[]}|null}
     */
    getPrice() {
        let totalVolume = 0
        let totalQuoteVolume = 0
        const sources = []
        for (const ohlcv of this.ohlcvs) {
            totalVolume += ohlcv.volume
            totalQuoteVolume += ohlcv.quoteVolume
            sources.push(ohlcv.source)
        }
        if (totalVolume === 0)
            return {price: 0n, sources: []}
        return {price: getBigIntPrice(totalQuoteVolume / totalVolume, this.decimals), sources}
    }
}

module.exports = Price