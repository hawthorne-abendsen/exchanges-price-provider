const BinancePriceProvider = require('./providers/binance-price-provider')
const BybitPriceProvider = require('./providers/bybit-price-provider')
const OkxPriceProvider = require('./providers/okx-price-provider')
const KrakenPriceProvider = require('./providers/kraken-price-provider')
const CoinbasePriceProvider = require('./providers/coinbase-price-provider')
const GatePriceProvider = require('./providers/gate-price-provider')
const Price = require('./models/price')

/**
 * @typedef {import('./models/pair')} Pair
 * @typedef {import('./providers/price-provider-base')} PriceProviderBase
 */

const cachedProviders = {}

/**
 * @param {string} name - provider name
 * @returns {PriceProviderBase}
 */
function getProvider(name) {
    switch (name) {
        case 'binance':
            if (!cachedProviders[name])
                cachedProviders[name] = new BinancePriceProvider()
            break
        case 'bybit':
            if (!cachedProviders[name])
                cachedProviders[name] = new BybitPriceProvider()
            break
        case 'okx':
            if (!cachedProviders[name])
                cachedProviders[name] = new OkxPriceProvider()
            break
        case 'kraken':
            if (!cachedProviders[name])
                cachedProviders[name] = new KrakenPriceProvider()
            break
        case 'coinbase':
            if (!cachedProviders[name])
                cachedProviders[name] = new CoinbasePriceProvider()
            break
        case 'gate':
            if (!cachedProviders[name])
                cachedProviders[name] = new GatePriceProvider()
            break
        default:
            return null
    }
    return cachedProviders[name]
}

/**
 * Gets aggregated prices from multiple providers
 * @param {string[]} providers - list of provider names
 * @param {Pair[]} pairs - list of pairs
 * @param {number} timestamp - timestamp in milliseconds
 * @param {number} timeframe - timeframe in minutes
 * @param {number} decimals - number of decimals for the price
 * @returns {Promise<{[key: string]: { price: BigInt, sources: string[] }}>}
 */
async function getPrices(providers, pairs, timestamp, timeframe, decimals) {
    const ohlcvs = {}
    const fetchPromises = []
    for (const providerName of providers) {
        const fetchOHLCVs = async () => {
            const providerOhlcvs = {}
            try {
                const provider = getProvider(providerName)
                if (!provider) {
                    console.warn(`Provider ${providerName} not found`)
                    return
                }
                if (Date.now() - provider.marketsLoadedAt > 1000 * 60 * 60 * 6) { //reload markets if older than 6 hours
                    try {
                        await provider.loadMarkets()
                    } catch (error) {
                        console.error(`Error loading markets for ${provider.name}: ${error.message}`)
                        return
                    }
                }
                for (const pair of pairs) {
                    try {
                        const ohlcv = await provider.getOHLCV(pair, timestamp, timeframe, decimals)
                        if (!ohlcv)
                            continue
                        providerOhlcvs[pair.name] = ohlcv
                    } catch (error) {
                        console.error(`Error getting price for ${pair} from ${provider.name}: ${error.message}`)
                    }
                }
            } catch (error) {
                console.error(`Error fetching data from ${providerName}: ${error.message}`)
            }
            ohlcvs[providerName] = providerOhlcvs
        }
        fetchPromises.push(fetchOHLCVs())
    }
    await Promise.all(fetchPromises)
    /**
     * @type {{[key: string]: Price}}
     */
    const prices = {}
    for (const providerName of Object.keys(ohlcvs)) {
        for (const pairName of Object.keys(ohlcvs[providerName])) {
            const ohlcv = ohlcvs[providerName][pairName]
            if (!prices[pairName]) {
                prices[pairName] = new Price(timestamp, decimals)
            }
            prices[pairName].pushOHLCV(ohlcv)
        }
    }
    return Object.keys(prices).reduce((acc, pairName) => {
        acc[pairName] = prices[pairName].getPrice()
        return acc
    }, {})
}

module.exports = {getPrices}