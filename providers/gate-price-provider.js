const OHLCV = require('../models/ohlcv')
const PriceProviderBase = require('./price-provider-base')

const baseUrl = 'https://api.gateio.ws/api/v4'


class GatePriceProvider extends PriceProviderBase {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseUrl}/spot/currency_pairs`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data
        return markets
            .filter(market => market.trade_status.toUpperCase() === 'TRADABLE')
            .map(market => market.id)
    }

    async getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        timestamp = timestamp / 1000 //convert to seconds
        const klinesUrl = `${baseUrl}/spot/candlesticks?currency_pair=${symbolInfo.symbol}&interval=${timeframe}m&from=${timestamp}&limit=1`
        const response = await this.__makeRequest(klinesUrl)
        const klines = response.data
        if (klines.length === 0) {
            return null
        }
        const kline = klines[0]
        return new OHLCV({
            open: kline[5],
            high: kline[3],
            low: kline[4],
            close: kline[2],
            volume: Number(kline[6]),
            quoteVolume: Number(kline[2]),
            inversed: symbolInfo.inversed,
            source: 'gate',
            decimals
        })
    }

    __formatSymbol(base, quote) {
        return `${base}_${quote}`
    }
}

module.exports = GatePriceProvider