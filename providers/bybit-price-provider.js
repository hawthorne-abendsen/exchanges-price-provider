const OHLCV = require('../models/ohlcv')
const PriceProviderBase = require('./price-provider-base')

const baseApiUrl = 'https://api.bybit.com/v5'

class BybitPriceProvider extends PriceProviderBase {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseApiUrl}/market/instruments-info?category=spot`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data.result.list
        return markets
            .filter(market => market.status.toUpperCase() === 'TRADING')
            .map(market => market.symbol)
    }

    async __getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        timestamp = timestamp * 1000
        const klinesUrl = `${baseApiUrl}/market/kline?category=spot&symbol=${symbolInfo.symbol}&interval=${timeframe}&start=${timestamp}&limit=1`
        const response = await this.__makeRequest(klinesUrl)
        const klines = response.data.result.list
        if (klines.length === 0) {
            return null
        }
        const kline = klines[0]
        PriceProviderBase.validateTimestamp(timestamp, kline[0])
        return new OHLCV({
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: Number(kline[5]),
            quoteVolume: Number(kline[6]),
            inversed: symbolInfo.inversed,
            source: this.name,
            decimals
        })
    }

    name = 'bybit'
}

module.exports = BybitPriceProvider