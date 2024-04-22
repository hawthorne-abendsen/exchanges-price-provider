/*eslint-disable no-undef */
const Asset = require('../models/asset')
const Pair = require('../models/pair')

/**
 * @typedef {import('../providers/price-provider-base')} PriceProviderBase
 */

function normalizeTimestamp(timestamp, timeframe) {
    return Math.floor(timestamp / timeframe) * timeframe
}


/**
 * @param {PriceProviderBase} provider
 * @returns {Promise<void>}
 */
async function loadMarkets(provider) {
    await provider.loadMarkets()
    //markets length should be greater than 0
    expect(provider.markets.length).toBeGreaterThan(0)
}

/**
 * @param {PriceProviderBase} provider
 * @param {Pair} pair
 * @param {boolean} expectNull
 * @returns {Promise<void>}
 */
async function getPriceTest(provider, pair, expectNull = false) {
    const price = await provider.getPrice(pair, getTimestamp(), 1, 8)
    if (expectNull) {
        expect(price).toBeNull()
        return null
    }
    expect(price).toBeGreaterThan(0n)
    return price
}

function getTimestamp() {
    return normalizeTimestamp(Date.now() - 60000 * 5, 60000)
}

const assets = {
    BTC: new Asset('BTC', ['BTC', 'XBT']),
    USD: new Asset('USD', ['USD', 'USDT', 'USDC']),
    ETH: new Asset('ETH', ['ETH']),
    SOL: new Asset('SOL', ['SOL']),
    ADA: new Asset('ADA', ['ADA']),
    AVAX: new Asset('AVAX', ['AVAX']),
    DOT: new Asset('DOT', ['DOT']),
    MATIC: new Asset('MATIC', ['MATIC']),
    LINK: new Asset('LINK', ['LINK']),
    DAI: new Asset('DAI', ['DAI']),
    ATOM: new Asset('ATOM', ['ATOM']),
    XLM: new Asset('XLM', ['XLM']),
    UNI: new Asset('UNI', ['UNI']),
    XRP: new Asset('XRP', ['XRP']),
    EURC: new Asset('EUR', ['EUR', 'EURC', 'EURT'])
}

const pairs = {
    pairs: [
        new Pair(assets.BTC, assets.USD),
        new Pair(assets.ETH, assets.USD),
        new Pair(assets.SOL, assets.USD),
        new Pair(assets.ADA, assets.USD),
        new Pair(assets.AVAX, assets.USD),
        new Pair(assets.DOT, assets.USD),
        new Pair(assets.MATIC, assets.USD),
        new Pair(assets.LINK, assets.USD),
        new Pair(assets.DAI, assets.USD),
        new Pair(assets.ATOM, assets.USD),
        new Pair(assets.XLM, assets.USD),
        new Pair(assets.UNI, assets.USD),
        new Pair(assets.XRP, assets.USD),
        new Pair(assets.EURC, assets.USD)
    ],
    invertedPair: new Pair(assets.USD, assets.BTC),
    invalidPair: new Pair(
        new Asset('UASC', ['UASC']),
        new Asset('SOME', ['SOME'])
    )
}

module.exports = {getPriceTest, loadMarkets, getTimestamp, pairs, assets}