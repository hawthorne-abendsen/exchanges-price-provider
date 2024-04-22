

/**
 * Get inversed price
 * @param {number} price - price value
 * @returns {number}
 */
function getInversedPrice(price) {
    return 1 / price
}

/**
 * Convert price to BigInt value with given decimals
 * @param {number} value - price value
 * @param {number} decimals - number of decimals
 * @returns {BigInt}
 */
function getBigIntPrice(value, decimals) {
    return BigInt(Math.round(value * (10 ** decimals)))
}

module.exports = {
    getBigIntPrice,
    getInversedPrice
}