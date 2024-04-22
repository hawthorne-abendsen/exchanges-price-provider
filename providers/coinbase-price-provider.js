const OHLCV = require('../models/ohlcv')
const PriceProviderBase = require('./price-provider-base')

const baseApiUrl = 'https://api.exchange.coinbase.com'

class CoinbasePriceProvider extends PriceProviderBase {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseApiUrl}/products`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data
        return markets
            .filter(market => market.status.toUpperCase() === 'ONLINE')
            .map(market => market.id)
    }

    async getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        const klinesUrl = `${baseApiUrl}/products/${symbolInfo.symbol}/candles?granularity=${timeframe}m&start=${timestamp}&end=${timestamp}`
        const response = await this.__makeRequest(klinesUrl)
        const klines = response.data
        if (klines.length === 0) {
            return null
        }
        const kline = klines[0]
        const ohlcv = {
            open: kline[3],
            high: kline[2],
            low: kline[1],
            close: kline[4],
            volume: Number(kline[5]),
            inversed: symbolInfo.inversed,
            source: 'coinbase',
            decimals
        }
        ohlcv.quoteVolume = ohlcv.volume * ((ohlcv.close + ohlcv.open + ohlcv.high + ohlcv.low) / 4)
        return new OHLCV(ohlcv)
    }

    __formatSymbol(base, quote) {
        return `${base}-${quote}`
    }
}

module.exports = CoinbasePriceProvider