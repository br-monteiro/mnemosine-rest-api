const AbstractHandler = require('./abstract-handler')
const { htr } = require('../../config')
const { setData, getData } = require('../../storage')
const { isBoundingBoxHtr } = require('../../utils')

class SetDataHtr extends AbstractHandler {
  /**
   * @param { InputData } data - The data object
   * @return { AbstractHandler }
   */
  handle (data) {
    try {
      let id = null
      let apikey = null
      let oldData = null

      const businessType = data.pricingInfos.businessType
      const rentalTotalPrice = Number(data.pricingInfos.rentalTotalPrice)

      const isAvailableForRental = businessType === 'RENTAL' && rentalTotalPrice <= htr.minRentalValue
      const isAvailableForSale = this.isAvailableForSale(data)
      const isAvailableToUpdate = this.isAvailableToUpdate(data)

      if (
        isAvailableToUpdate &&
        (isAvailableForRental || isAvailableForSale)
      ) {
        apikey = 'htr'
        oldData = getData(apikey, data.id)

        id = setData(apikey, data)
      }

      return super.handle(data, apikey, id, oldData)
    } catch (error) {
      return super.handle(data)
    }
  }

  /**
   * Check if the data is available for rental
   * @param { InputData } data
   * @returns { boolean }
   */
  isAvailableForSale (data) {
    const businessType = data.pricingInfos.businessType
    let price = Number(data.pricingInfos.price)

    if (businessType !== 'SALE') return false

    const lat = data.address.geoLocation.location.lat
    const lon = data.address.geoLocation.location.lon
    const usableAreas = data.usableAreas

    price = isBoundingBoxHtr(lat, lon) ? price - (price * 0.1) : price

    const squareMeterValue = price / usableAreas

    return usableAreas > 0 &&
      squareMeterValue > htr.maxSquareMeterValue &&
      price < htr.minSaleValue
  }
}

module.exports = SetDataHtr
