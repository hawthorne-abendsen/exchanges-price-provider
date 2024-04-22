/*eslint-disable no-undef */
const {getPrices} = require('../index')
const {pairs, getTimestamp} = require('./base-tests')


describe('index', () => {
    it('get prices', async () => {
        const providers = ['binance', 'bybit', 'coinbase', 'gate', 'kraken', 'okx']
        const prices = await getPrices(providers, pairs.pairs, getTimestamp(), 1, 8)
        expect(Object.keys(prices).length).toBeGreaterThan(0)
    }, 30000)
})