const WebSocket = require('ws')
const app = require('../app')
const http = require('http')
const url = require('url')

const wss1 = new WebSocket.Server({ noServer: true })
const wss2 = new WebSocket.Server({ noServer: true })

wss1.on('connection', function connection(ws) {
  // ...
  console.log('connected to wss1')
  wss1.on('message', function incoming(message) {
    console.log('received: %s', message);
  })
  let i = 0
  setInterval(() => {
    const str = 'this is a message: ' + i.toString()
    ws.send(str)
    i++
  }, 1000)
  
})
  
wss2.on('connection', function connection(ws) {
  // ...
})

function initHttpServer() {
  const server = http.createServer(app)
  server.listen(8082)

  server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname
    console.log(pathname)

    if (pathname === '/path1') {
      wss1.handleUpgrade(request, socket, head, function done(ws) {
        wss1.emit('connection', ws, request)
      });
    } else if (pathname === '/bar') {
      wss2.handleUpgrade(request, socket, head, function done(ws) {
        wss2.emit('connection', ws, request)
      });
    } else {
      socket.destroy()
    }
  })
}

module.exports = initHttpServer
