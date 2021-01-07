function isRowsExist(rows) {
  if(rows && typeof rows === 'Function' && rows.length > 0) {
    return true
  }
  return false
}

function genDateNow() {
  return new Date().toISOString()
}

module.exports = {
  isRowsExist,
  genDateNow
}