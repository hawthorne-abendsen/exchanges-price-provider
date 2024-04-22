class Asset {
    /**
     * @param {string} name - asset name
     * @param {string[]} alias - asset alias
     */
    constructor(name, alias) {
        this.name = name
        this.alias = alias
    }
}

module.exports = Asset