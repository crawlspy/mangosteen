const electron = require('electron')

const { ipcMain, net } = electron
class Conv {
  constructor(body) {
    this.body = body
  }

  async json() {
    return JSON.parse(this.body.toString())
  }

  async text() {
    return this.body.toString()
  }
}

export default function fetch(url, opts = {}) {
  const options = {
    method: 'GET',
    url,
    ...opts
  }
  const { headers } = options
  return new Promise((resolve, reject) => {
    const req = net.request(options)
    for (const headerName in headers) {
      if (typeof headers[headerName] === 'string')
        req.setHeader(headerName, headers[headerName])
      else {
        for (const headerValue of headers[headerName]) {
          req.setHeader(headerName, headerValue)
        }
      }
    }
    req
      .on('response', async response => {
        let body = ''
        response.on('data', chunk => {
          body += chunk
        })
        response.on('end', () => {
          resolve(new Conv(body))
        })
      })
      .on('abort', () => {})
      .on('error', error => {})
    ipcMain.once('cancelAllRequest', (event, data) => {
      req.abort()
    })
    req.end()
  })
}
