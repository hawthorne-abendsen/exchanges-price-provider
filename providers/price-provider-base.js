/**
 * @typedef {import('../models/pair')} Pair
 * @typedef {import('../models/ohlcv')} OHLCV
 */

const {default: axios} = require('axios')
const OHLCV = require('../models/ohlcv')
const {getBigIntPrice} = require('../utils')

const defaultOptions = {
    timeout: 2000
}

class PriceProviderBase {
    constructor(apiKey, secret) {
        if (this.constructor === PriceProviderBase)
            throw new Error('PriceProviderBase is an abstract class and cannot be instantiated')
        this.apiKey = apiKey
        this.secret = secret
        this.markets = []
        this.__cachedSymbols = {}
    }

    marketsLoadedAt = 0

    /**
     * @returns {Promise<void>}
     * @abstract
     */
    async loadMarkets() {
        const markets = await this.__loadMarkets()
        this.__cachedSymbols = {} //clear cache
        this.marketsLoadedAt = Date.now() //set timestamp
        this.markets = markets //set markets
    }

    /**
     * @returns {Promise<Array<string>>} Returns supported symbols
     * @abstract
     */
    __loadMarkets() {
        throw new Error('Not implemented')
    }


    /**
     * @param {Pair} pair - pair to get price for
     * @param {number} timestamp - timestamp in milliseconds
     * @param {number} timeframe - timeframe in minutes
     * @param {number} decimals - number of decimals for the price
     * @returns {Promise<number>}
     * @abstract
     */
    async getPrice(pair, timestamp, timeframe, decimals) {
        const ohlcv = await this.getOHLCV(pair, timestamp, timeframe, decimals)
        if (!ohlcv)
            return null

        return ohlcv.price()
    }

    /**
     *
     * @param {Pair} pair - pair to get OHLCV for
     * @param {number} timestamp - timestamp in seconds
     * @param {number} timeframe - timeframe in minutes
     * @param {number} decimals - number of decimals for the price
     * @returns {Promise<OHLCV|null>}
     * @abstract
     */
    getOHLCV(pair, timestamp, timeframe, decimals) {
        if (pair.base.name === pair.quote.name) {
            const price = getBigIntPrice(1, decimals)
            return new OHLCV({
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 0,
                quoteVolume: 0,
                inversed: false,
                source: this.name,
                decimals
            })
        }
        return this.__getOHLCV(pair, timestamp, timeframe, decimals)
    }

    __getOHLCV(pair, timestamp, timeframe, decimals) {
        throw new Error('Not implemented')
    }

    /**
     * @param {Pair} pair - pair to get symbol info for
     * @returns {{symbol: string, inversed: boolean} | null}
     * @abstract
     */
    getSymbolInfo(pair) {
        if (this.__cachedSymbols[pair.name])
            return this.__cachedSymbols[pair.name]
        /**
         *
         * @param {Asset} base
         * @param {Asset} quote
         * @param {boolean} [inversed]
         * @returns {string|null}
         */
        const getSymbol = (base, quote, inversed = false) => {
            for (const alias of base.alias) {
                for (const quoteAlias of quote.alias) {
                    const symbol = this.__formatSymbol(alias, quoteAlias)
                    if (this.markets.indexOf(symbol) >= 0)
                        return {symbol, inversed}
                }
            }
            return null
        }
        const symbol = this.__cachedSymbols[pair.name] = getSymbol(pair.base, pair.quote) || getSymbol(pair.quote, pair.base, true)
        return symbol
    }

    /**
     * @param {string} base
     * @param {string} quote
     * @returns {string}
     * @protected
     */
    __formatSymbol(base, quote) {
        return `${quote.toUpperCase()}${base.toUpperCase()}`
    }

    /**
     * @param {string} url - request url
     * @param {any} [options] - request options
     * @returns {Promise<any>}
     * @protected
     */
    __makeRequest(url, options = {}) {
        const requestOptions = {
            ...defaultOptions,
            ...options,
            url
        }
        return axios.request(requestOptions)
    }

    static validateTimestamp(expectedTimestamp, actualTimestamp) {
        if (expectedTimestamp.toString() !== actualTimestamp?.toString())
            throw new Error(`Timestamp mismatch: ${actualTimestamp} !== ${expectedTimestamp}`)
    }
}

module.exports = PriceProviderBase