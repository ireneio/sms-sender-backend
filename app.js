const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const initDb = require('./db/index').init
const initHttpServer = require('./ws/index')

const indexRouter = require('./routes/index')

const app = express()
const routers = [
  { path: '/', router: indexRouter }
]


function initExpress(app, routers) {
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, 'public')))

  // CORS Headers
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', ['Authorization', 'Content-Type'])
    next()
  })

  routers.forEach(item => {
    app.use(item.path, item.router)
  })

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404))
  })

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
  })
}

async function initApp() {
  initExpress(app, routers)
  initHttpServer()
  await initDb()
}

initApp()

module.exports = app
