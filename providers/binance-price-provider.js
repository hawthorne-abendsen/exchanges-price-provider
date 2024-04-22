const OHLCV = require('../models/ohlcv')
const PriceProvider = require('./price-provider-base')

const baseApiUrl = 'https://api.binance.com/api/v3'

class BinancePriceProvider extends PriceProvider {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseApiUrl}/exchangeInfo`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data.symbols
        return markets
            .filter(market => market.status === 'TRADING')
            .map(market => market.symbol)
    }

    async getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        const klinesUrl = `${baseApiUrl}/klines?symbol=${symbolInfo.symbol}&interval=${timeframe}m&startTime=${timestamp}&limit=1`
        const response = await this.__makeRequest(klinesUrl)
        const klines = response.data
        if (klines.length === 0) {
            return null
        }
        const kline = klines[0]
        return new OHLCV({
            open: kline[1],
            high: kline[2],
            low: kline[3],
            close: kline[4],
            volume: Number(kline[5]),
            quoteVolume: Number(kline[7]),
            inversed: symbolInfo.inversed,
            source: 'binance',
            decimals
        })
    }
}

module.exports = BinancePriceProvider