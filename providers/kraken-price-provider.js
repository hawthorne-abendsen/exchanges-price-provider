const OHLCV = require('../models/ohlcv')
const PriceProviderBase = require('./price-provider-base')

const baseApiUrl = 'https://api.kraken.com/0'

class KrakenPriceProvider extends PriceProviderBase {
    constructor(apiKey, secret) {
        super(apiKey, secret)
    }

    async __loadMarkets() {
        const marketsUrl = `${baseApiUrl}/public/AssetPairs`
        const response = await this.__makeRequest(marketsUrl)
        const markets = response.data.result
        return Object.keys(markets)
            .filter(market => markets[market].status.toUpperCase() === 'ONLINE')
            .map(market => markets[market].altname)
    }

    async getOHLCV(pair, timestamp, timeframe, decimals) {
        const symbolInfo = this.getSymbolInfo(pair)
        if (!symbolInfo)
            return null
        timestamp = timestamp / 1000//convert to seconds
        //since is exclusive, so we need to subtract a second to get the kline that matches the timestamp
        const klinesUrl = `${baseApiUrl}/public/OHLC?pair=${symbolInfo.symbol}&interval=${timeframe}&since=${timestamp - 1}`
        const response = await this.__makeRequest(klinesUrl)

        //Kraken API returns an object with the last and the pair name. Pair name is not always the same as the symbol
        const klines = response.data.result[Object.keys(response.data.result).filter(k => k !== 'last')[0]]

        //Kraken API doesn't have limit=1, so we need to find the kline that matches the timestamp
        const getCurrentKline = () => {
            for (let i = 0; i < klines.length; i++) {
                if (klines[i][0] === timestamp) {
                    return klines[i]
                }
            }
        }

        const kline = getCurrentKline()
        if (!kline) {
            return null
        }
        return new OHLCV({
            open: Number(kline[1]),
            high: Number(kline[2]),
            low: Number(kline[3]),
            close: Number(kline[4]),
            volume: Number(kline[6]),
            quoteVolume: Number(kline[5]) * Number(kline[6]), //volume * vwap
            inversed: symbolInfo.inversed,
            source: 'kraken',
            decimals
        })
    }

    __formatSymbol(base, quote) {
        return `${base}${quote}`
    }
}

module.exports = KrakenPriceProvider