const client = require('../db/index').client
const bcrypt = require('bcrypt')
const isRowsExist = require('../db/helper').isRowsExist
const genDateNow = require('../db/helper').genDateNow
const saltRounds = 10

async function createUser(email, password) {
  const createTableText = `
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  CREATE TEMP TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR (255) NOTNULL,
    password VARCHAR (255) NOT NULL,
    contacts JSONB,
    lastUpdated DATE NOT NULL DEFAULT CURRENT_DATE,
    lastLogin DATE NOT NULL DEFAULT CURRENT_DATE,
    accessToken VARCHAR (255),
    refreshToken VARCHAR (255),
    status BOOLEAN NOT NULL DEFAULT true,
  );
  `
  try {
    await client.query(createTableText)
    bcrypt.hash(password, saltRounds, async function(err, hashedPassword) {
      if(err) throw new Error('[DB] createUser Error: Hashing Password' + err)
      const { rows } = await client.query('INSERT INTO users(email, password, lastUpdated) VALUES($1, $2, $3)', [email, hashedPassword, genDateNow()])
      return isRowsExist(rows) && rows
    })
  } catch(e) {
    console.log('[DB] createUser Error: ' + e.message)
    return false
  }
}

async function getUserInfo(email, password) {
  try {
    const { rows } = await client.query('SELECT (email, password, accessToken, refreshToken, contacts, lastLogin) FROM users WHERE email = $1', [email])
    if(isRowsExist(rows)) {
      bcrypt.compare(password, rows[0].password, function(err, result) {
        if(err) throw new Error('[DB] createUser Error: Decrypting Password' + err)
        if(result) {
          return rows
        } else {
          return false
        }
      })
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] getUser Error: ' + e.message)
    return false
  }
}

async function updateUserInfo(email, newVal, type = 'null') {
  try {
    if(type === 'null') {
      throw new Error('Type not given.')
    } else if(type === 'email') {
      const { rows } = await client.query('INSERT INTO users(email, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, newVal, genDateNow()])
      return isRowsExist(rows) && rows
    } else if(type === 'token') {
      const { rows } = await client.query('INSERT INTO users(token, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, newVal, genDateNow()])
      return isRowsExist(rows) && rows
    } else if(type === 'password') {
      if(err) throw new Error('[DB] updateUser Error: Decrypting Password' + err)
      bcrypt.hash(newVal, saltRounds, async function(err, hashedPassword) {
        if(err) throw new Error('[DB] updateUser Error: Hashing Password' + err)
        const { rows } = await client.query('INSERT INTO users(password, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, hashedPassword, genDateNow()])
        return isRowsExist(rows) && rows
      })
    } else if(type === 'status') {
      let result
      if(newVal === true) {
        const { rows } = await client.query('INSERT INTO users(status, lastUpdated, lastLogin) WHERE email = $1 VALUES($2, $3, $4)', [email, newVal, genDateNow(), genDateNow()])
        result = rows
      } else {
        const { rows } = await client.query('INSERT INTO users(status, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, newVal, genDateNow()])
        result = rows
      }
      return isRowsExist(result) && result
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] updateUserInfo Error: ' + e.message)
    return false
  }
}

async function updateUserContacts(contact, email) {
  try {
    const { rowsQ1 } = await client.query('SELECT contacts FROM users WHERE email = $1', [email])
    if(isRowsExist(rowsQ1)) {
      const contacts = JSON.parse(rowsQ1[0].contacts)
      const { rowsQ2 } = await client.query('INSERT INTO users(contacts, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, [ ...contacts, contact], genDateNow()])
      return isRowsExist(rowsQ2) && rowsQ2
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] updateUserContacts Error: ' + e.message)
    return false
  }
}

async function deleteUser(email) {
  try {
    const { rows } = await client.query('DELETE FROM users WHERE email = $1', [email])
    if(isRowsExist(rows)) {
      return rows
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] deleteUser Error: ' + e.message)
    return false
  }
}

module.exports = {
  createUser,
  getUserInfo,
  updateUserInfo,
  updateUserContacts,
  deleteUser
}