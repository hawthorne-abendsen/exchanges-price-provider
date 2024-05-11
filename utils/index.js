/**
 * @typedef {import('../models/ohlcv')} OHLCV
 */

/**
 * Get inversed price
 * @param {BigInt} price - price value
 * @param {number} decimals - number of decimals
 * @returns {BigInt}
 */
function getInversedPrice(price, decimals) {
    if (price === BigInt(0))
        return BigInt(0) //avoid division by zero
    //check if price is BigInt
    if (typeof price !== 'bigint')
        throw new Error('Price must be BigInt')
    return BigInt(Math.pow(10, decimals * 2)) / price
}

/**
 * Convert price to BigInt value with given decimals
 * @param {number} value - price value
 * @param {number} decimals - number of decimals
 * @returns {BigInt}
 */
function getBigIntPrice(value, decimals) {
    value = Number(value)
    if (isNaN(value))
        return BigInt(0)
    if (isNaN(decimals))
        throw new Error('Decimals must be a number')
    return BigInt(Math.round(value * Math.pow(10, decimals)))
}

/**
 * Calculate price from volume and quote volume
 * @param {number} volume - volume
 * @param {number} quoteVolume - quote volume
 * @param {number} decimals - number of decimals
 * @returns {BigInt}
 */
function getVWAP(volume, quoteVolume, decimals) {
    if (isNaN(volume) || isNaN(quoteVolume))
        return 0n
    const totalVolumeBigInt = getBigIntPrice(volume, decimals)
    const totalQuoteVolumeBigInt = getBigIntPrice(quoteVolume, decimals * 2) //multiply decimals by 2 to get correct price
    if (totalQuoteVolumeBigInt === 0n || totalVolumeBigInt === 0n)
        return 0n
    return totalQuoteVolumeBigInt / totalVolumeBigInt
}

/**
 * Calculates the median price from the OHLCVs
 * @param {OHLCV[]} ohlcvs - list of OHLCVs
 * @returns {BigInt}
 */
function getMedianPrice(ohlcvs) {
    const prices = ohlcvs.map(ohlcv => ohlcv.price()).filter(price => price > 0n)
    prices.sort((a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
    })

    const middle = prices.length / 2

    if (prices.length % 2 === 1) { //odd, return middle
        return prices[Math.floor(middle)]
    } else {
        const left = prices[middle - 1]
        const right = prices[middle]
        return (left + right) / BigInt(2)
    }
}

module.exports = {
    getBigIntPrice,
    getInversedPrice,
    getVWAP,
    getMedianPrice
}