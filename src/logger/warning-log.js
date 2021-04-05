class WarningLog {
  constructor (boleReference) {
    if (!boleReference) throw new Error('The log engine is required')

    /**
     * @type { import('bole') }
     */
    this.bole = boleReference
  }

  /**
   * @param { LogType } type - The type of log
   * @param { string } message - The message of log
   * @param { Object } info - The object with more details about log
   */
  async log (type, message = '', info = {}) {
    if (type !== 'warning') return false

    this.bole.warn(message, info)

    return true
  }
}

module.exports = WarningLog
