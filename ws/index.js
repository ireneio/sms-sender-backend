const WebSocket = require('ws')
const app = require('../app')
const http = require('http')
const url = require('url')

function connectionsMap(contacts) {
  return contacts.map(contact => ({ id: contact.id }))
}

function createWss(connections) {
  const wssArr = []
  const pathnames = []
  connections.forEach((connection, index) => {
    const { id } = connection
    wssArr[index] = { wss: null, pathname: id }
    pathnames.push(id)
    wssArr[index].wss = new WebSocket.Server({ noServer: true })
    wssArr[index].wss.on('connection', function connection(ws) {
      let interval
      console.log(`[WS] Connected to ${wssArr[index].wss}`)
      wssArr[index].wss.on('message', function incoming(message) {
        console.log('received: %s', message)
        // access DB
      })
      wssArr[index].wss.on('close', function(ws) {
        interval = null
      })
      let i = 0
      interval = setInterval(() => {
        const str = 'this is a message: ' + i.toString()
        ws.send(str)
        i++
      }, 1000)
    })
  })
  return { wssArr, pathnamesList: pathnames }
}

function serverVerifyPath(pathnamesList, pathname) {
  const find = pathnamesList.find(existingPathname => pathname === existingPathname)
  return find
}

function serverAddPath(head, wssArr, pathnamesList, pathname) {
  const name = serverVerifyPath(pathnamesList, pathname)
  if(name) {
    const findWss = wssArr.find(wss => wss.pathname === name)
    const wss = findWss.wss
    wss.handleUpgrade(request, socket, head, function(ws) {
      wss.emit('connection', ws, request)
    })
    console.log(`[WS] Path ${name} Added.`)
  } else {
    return false
  }
}

function initHttpServerAndWsUpgrade(contacts) {
  const server = http.createServer(app)
  server.listen(8082)

  // connections = [{ id: 12345 }]
  const connections = connectionsMap(contacts)
  const [ wssArr, pathnamesList ] = createWss(connections)

  server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname
    console.log('[Http] Incoming request received; Pathname: ' + pathname)

    const addPath = serverAddPath(head, wssArr, pathnamesList, pathname)
    if(!addPath) socket.destroy()
  })
}

module.exports = initHttpServerAndWsUpgrade
