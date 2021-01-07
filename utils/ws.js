const WebSocket = require('ws')
const http = require('http')
const url = require('url')

class Ws {
  constructor(app, port, contacts) {
    this.app = app
    this.port = port
    this.contacts = [ ...contacts ]
    this.connections = [{ id: 12345 }]
    this.pathnamesList = []
  }

  connectionsMap() {
    return this.contacts.map(contact => ({ id: contact.id }))
  }

  initWss() {
    // connections = [{ id: 12345 }]
    const wssArr = []
    const pathnames = []
    this.connections.forEach((connection, index) => {
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

  serverVerifyPath(pathname) {
    const find = this.pathnamesList.find(existingPathname => pathname === existingPathname)
    return find
  }

  serverAddPath(head, wssArr, pathname) {
    const pathname = serverVerifyPath(pathname)
    if(pathname) {
      const findWss = wssArr.find(wss => wss.pathname === pathname)
      const wss = findWss.wss
      wss.handleUpgrade(request, socket, head, function(ws) {
        wss.emit('connection', ws, request)
      })
      console.log(`[WS] Path ${pathname} Added.`)
    } else {
      return false
    }
  }

  init() {
    const server = http.createServer(this.app)
    server.listen(this.port)

    // connections = [{ id: 12345 }]
    this.connections = this.connectionsMap()
    const [ wssArr, pathnamesList ] = this.initWss()
    this.pathnamesList = [ ...pathnamesList ]

    server.on('upgrade', function upgrade(request, socket, head) {
      const pathname = url.parse(request.url).pathname
      console.log('[Http] Incoming request received; Pathname: ' + pathname)
  
      const addPath = this.serverAddPath(head, wssArr, pathname)
  
      if(!addPath) socket.destroy()
      return true
    })
  }
}

module.exports = Ws