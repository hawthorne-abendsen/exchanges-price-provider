/*eslint-disable no-undef */
const {getPrices} = require('../index')
const {assets, getTimestamp} = require('./base-tests')


describe('index', () => {
    it('get prices', async () => {
        const prices = await getPrices(assets, 'USD', getTimestamp(), 60, 14)
        console.log(prices)
        expect(prices.length).toBe(assets.length)
    }, 30000)
})