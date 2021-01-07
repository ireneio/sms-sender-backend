const { Client } = require('pg')
const connectionString = process.env.PG_CONNSTR || ''
let client

async function init() {
  try {
    client = new Client({
      connectionString,
    })
    await client.connect()
    console.log('[DB] Connected!')
    await client.query('SELECT NOW()', (err, res) => {
      if(err) {
        console.log('[DB] Error: ' + err)
        return
      }
      console.log('[DB] SELECT NOW(): ' + JSON.stringify(res.rows))
      client.end()
    })
  } catch(e) {
    console.log('[DB] Error: ' + e.message)
  }
}

module.exports = {
  init,
  client
}