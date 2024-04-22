const OHLCV = require('../models/ohlcv')
const PriceProviderBase = require('./price-provider-base')

const baseApiUrl = 'https://www.okx.com/api/v5'

class OkxPriceProvider extends PriceProviderBase {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseApiUrl}/public/instruments?instType=SPOT`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data.data
        return markets
            .filter(market => market.state.toUpperCase() === 'LIVE')
            .map(market => market.instId)
    }

    async getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        const klinesUrl = `${baseApiUrl}/market/candles?instId=${symbolInfo.symbol}&bar=${timeframe}m&after=${timestamp}&limit=1`
        const response = await this.__makeRequest(klinesUrl)
        const klines = response.data.data
        if (klines.length === 0) {
            return null
        }
        const kline = klines[0]
        return new OHLCV({
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: Number(kline[6]),
            quoteVolume: Number(kline[7]),
            inversed: symbolInfo.inversed,
            source: 'okx',
            decimals
        })
    }

    __formatSymbol(base, quote) {
        return `${base}-${quote}`
    }
}

module.exports = OkxPriceProvider