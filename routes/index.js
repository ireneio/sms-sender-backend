const express = require('express')
const router = express.Router()

/* GET server health. */
router.get('/', function(req, res, next) {
  res.send('Server Running!')
})

module.exports = router
