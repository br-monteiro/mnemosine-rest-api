const request = require('request')
const readline = require('readline')

const logger = require('../logger')('data-requester')
const InputProcessor = require('../input-processor')
const { jsonParse } = require('../utils')

/**
 * Read the file according URL
 * @param { string } url - The URL of the source file
 * @param { (String) => {} } cb - The callback function fired on each line of file
 * @returns { Promise }
 */
function readSourceFile (url, cb) {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      logger.error('The URL is required', url)
      return reject(new Error('The URL is required'))
    }

    const lineBuffer = []

    const rl = readline.createInterface({
      input: request
        .get(url)
        .on('error', err => {
          logger.error('error with URL request', err)

          return reject(err)
        })
    })

    rl
      .on('line', (line) => {
        lineBuffer.push(line)

        if (typeof cb === 'function') {
          cb.call(this, line)
        }
      })
      .on('error', error => {
        logger.error('there was an error when trying to access the URL', error)
        reject(error)
      })
      .on('close', () => resolve(lineBuffer))
  })
}

/**
 * Process the source and insert the data into storage
 * @param { string } url - The URL of the source file
 * @returns { Promise }
 */
async function processSource (url) {
  if (!url || typeof url !== 'string') {
    logger.error('The URL is required', url)

    throw new Error('The URL is required')
  }

  const inputProcessor = new InputProcessor()

  try {
    return readSourceFile(url, line => {
      const json = jsonParse(line, {})

      inputProcessor.run(json)
    })
  } catch (error) {
    logger.error('there was an error when trying to access the URL', error)
  }
}

module.exports = {
  readSourceFile,
  processSource
}
