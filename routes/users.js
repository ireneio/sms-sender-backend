const express = require('express')
const router = express.Router()
const getUserInfo = require('../controllers/users').getUserInfo
const initHttpServerAndWsUpgrade = require('../ws/index')

/* GET user info. */
router.post('/', function(req, res) {
  const { email, password } = req.body
  const dbAccessResult = getUserInfo(email, password)
  if(dbAccessResult) {
    const [ userInfo ] = dbAccessResult
    initHttpServerAndWsUpgrade(userInfo.contacts)
    // send user info
    res.send('Server Running!')
  } else {
    res.status(404).send('User Info Not Found.')
  }
})

module.exports = router