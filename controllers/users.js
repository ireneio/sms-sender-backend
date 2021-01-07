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
    contacts text ARRAY,
    lastUpdated DATE NOT NULL DEFAULT CURRENT_DATE,
    accessToken VARCHAR (255),
    refreshToken VARCHAR (255)
  );
  `
  try {
    await client.query(createTableText)
    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
      if(err) throw new Error('[DB] createUser Error: Hashing Password' + err)
      await client.query('INSERT INTO users(email, password, lastUpdated) VALUES($1, $2, $3)', [email, hashedPassword, genDateNow()])
      return true
    })
  } catch(e) {
    console.log('[DB] createUser Error: ' + e.message)
    return false
  }
}

async function getUserInfo(email, password) {
  try {
    const { rows } = await client.query('SELECT (password, accessToken, refreshToken) FROM users WHERE email = $1', [email])
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
      return rows
    } else if(type === 'token') {
      const { rows } = await client.query('INSERT INTO users(token, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, newVal, genDateNow()])
      return rows
    } else if(type === 'password') {
      if(err) throw new Error('[DB] updateUser Error: Decrypting Password' + err)
      bcrypt.hash(newVal, saltRounds, function(err, hashedPassword) {
        if(err) throw new Error('[DB] updateUser Error: Hashing Password' + err)
        const { rows } = await client.query('INSERT INTO users(password, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, hashedPassword, genDateNow()])
        return rows
      })
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
    const { rows } = await client.query('SELECT contacts FROM users WHERE email = $1', [email])
    if(isRowsExist(rows)) {
      const contacts = JSON.parse(rows[0].contacts)
      const { rows } = await client.query('INSERT INTO users(contacts, lastUpdated) WHERE email = $1 VALUES($2, $3)', [email, JSON.stringify([ ...contacts, contact]), genDateNow()])
      return rows
    } else {
      return false
    }
  } catch(e) {
    console.log('[DB] updateUserContacts Error: ' + e.message)
    return false
  }
}

module.exports = {
  createUser,
  getUserInfo,
  updateUserInfo,
  updateUserContacts
}