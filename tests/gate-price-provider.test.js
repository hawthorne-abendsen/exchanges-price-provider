/*eslint-disable no-undef */
const GatePriceProvider = require('../providers/gate-price-provider')
const {getPriceTest, loadMarkets, pairs} = require('./base-tests')

const provider = new GatePriceProvider()

describe('GatePriceProvider', () => {
    it('load markets', async () => {
        await loadMarkets(provider)
    })

    it('get price', async () => {
        await getPriceTest(provider, pairs.pairs[0])
    })

    it('get price for inverted pair', async () => {
        await getPriceTest(provider, pairs.invertedPair)
    })

    it('get price for invalid pair', async () => {
        await getPriceTest(provider, pairs.invalidPair, true)
    })
})