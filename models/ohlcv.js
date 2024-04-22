const {getInversedPrice, getBigIntPrice} = require('../utils')

class OHLCV {
    /**
     *
     * @param {{open: number, high: number, low: number, close: number, volume: number, quoteVolume: number, inversed: boolean, source: string}} raw - raw data
     */
    constructor(raw) {
        const {open, high, low, close, volume, quoteVolume, inversed, source, decimals} = raw
        this.open = getBigIntPrice(inversed ? getInversedPrice(open) : open, decimals)
        this.high = getBigIntPrice(inversed ? getInversedPrice(low) : high, decimals)
        this.low = getBigIntPrice(inversed ? getInversedPrice(high) : low, decimals)
        this.close = getBigIntPrice(inversed ? getInversedPrice(close) : close, decimals)
        this.volume = inversed ? quoteVolume : volume
        this.quoteVolume = inversed ? volume : quoteVolume
        this.decimals = decimals
        this.source = source
    }

    /**
     * @returns {BigInt}
     */
    price() {
        return getBigIntPrice(this.quoteVolume / this.volume, this.decimals)
    }
}

module.exports = OHLCV