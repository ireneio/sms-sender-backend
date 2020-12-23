const axios = require('axios')

const axios = axios.config({
  baseUrl: '',
  timeout: 10000,
  headers: {
    authorization: '',
    'content-type': 'application/json'
  }
})

module.exports = config